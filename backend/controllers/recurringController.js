const RecurringSchedule = require('../models/RecurringSchedule');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  generateForSchedule,
  generateAllActive,
  syncFutureOccurrences,
  deleteFutureOccurrences,
  deleteAllOccurrences,
} = require('../services/occurrenceGenerator');
const { toDateStr } = require('../utils/dateHelpers');

const validateScheduleBody = (body, res) => {
  const {
    title,
    frequency,
    startDate,
    selectedDays,
    interval,
    dayOfMonth,
  } = body;

  if (!title || !String(title).trim()) {
    res.status(400);
    throw new Error('Title is required');
  }

  if (!frequency) {
    res.status(400);
    throw new Error('Frequency is required');
  }

  if (!startDate) {
    res.status(400);
    throw new Error('Start date is required');
  }

  if (['weekly', 'custom_days'].includes(frequency)) {
    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
      res.status(400);
      throw new Error('Select at least one weekday for this frequency');
    }
  }

  if (frequency === 'custom_interval' && (!interval || Number(interval) < 1)) {
    res.status(400);
    throw new Error('Interval must be at least 1');
  }

  if (frequency === 'monthly') {
    const day = Number(dayOfMonth || 1);
    if (day < 1 || day > 31) {
      res.status(400);
      throw new Error('Day of month must be between 1 and 31');
    }
  }
};

const normalizePayload = (body) => {
  const frequency = body.frequency;
  let selectedDays = Array.isArray(body.selectedDays)
    ? body.selectedDays.map(Number)
    : [];

  if (frequency === 'weekly' && selectedDays.length === 0 && body.weekday != null) {
    selectedDays = [Number(body.weekday)];
  }

  return {
    title: String(body.title).trim(),
    description: body.description?.trim() || '',
    priority: body.priority || 'medium',
    frequency,
    selectedDays,
    interval: Math.max(1, Number(body.interval) || 1),
    intervalUnit: body.intervalUnit === 'weeks' ? 'weeks' : 'days',
    dayOfMonth: Number(body.dayOfMonth) || 1,
    startDate: new Date(body.startDate),
    dueTime: body.dueTime || '09:00',
    endDate: body.endDate ? new Date(body.endDate) : null,
    isActive: body.isActive !== false,
    timezone: body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
};

// POST /api/recurring-tasks/generate
const generateOccurrences = asyncHandler(async (req, res) => {
  const result = await generateAllActive();
  res.status(200).json({
    success: true,
    message: 'Occurrences generated',
    data: result,
  });
});

// GET /api/recurring-tasks
const getSchedules = asyncHandler(async (req, res) => {
  await generateAllActive();
  const schedules = await RecurringSchedule.find().sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    schedules.map(async (schedule) => {
      const [upcoming, completed, pending, total] = await Promise.all([
        Task.countDocuments({
          recurringScheduleId: schedule._id,
          status: { $ne: 'completed' },
          occurrenceDate: {
            $gte: toDateStr(new Date(), schedule.timezone),
          },
        }),
        Task.countDocuments({
          recurringScheduleId: schedule._id,
          status: 'completed',
        }),
        Task.countDocuments({
          recurringScheduleId: schedule._id,
          status: { $in: ['todo', 'in_progress'] },
        }),
        Task.countDocuments({ recurringScheduleId: schedule._id }),
      ]);

      return {
        ...schedule.toObject(),
        counts: { upcoming, completed, pending, total },
      };
    })
  );

  res.status(200).json({ success: true, count: withCounts.length, data: withCounts });
});

// GET /api/recurring-tasks/:id
const getSchedule = asyncHandler(async (req, res) => {
  const schedule = await RecurringSchedule.findById(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error('Recurring schedule not found');
  }

  if (schedule.isActive) {
    await generateForSchedule(schedule);
  }

  const occurrences = await Task.find({ recurringScheduleId: schedule._id }).sort({
    occurrenceDate: -1,
  });

  res.status(200).json({
    success: true,
    data: { schedule, occurrences },
  });
});

// POST /api/recurring-tasks
const createSchedule = asyncHandler(async (req, res) => {
  validateScheduleBody(req.body, res);
  const payload = normalizePayload(req.body);
  const schedule = await RecurringSchedule.create(payload);
  const generation = await generateForSchedule(schedule);

  res.status(201).json({
    success: true,
    message: 'Recurring schedule created',
    data: schedule,
    generation,
  });
});

// PUT /api/recurring-tasks/:id
const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await RecurringSchedule.findById(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error('Recurring schedule not found');
  }

  validateScheduleBody({ ...schedule.toObject(), ...req.body, title: req.body.title ?? schedule.title }, res);

  const payload = normalizePayload({
    ...schedule.toObject(),
    ...req.body,
    title: req.body.title ?? schedule.title,
    startDate: req.body.startDate ?? schedule.startDate,
    frequency: req.body.frequency ?? schedule.frequency,
  });

  // Preserve isActive unless explicitly set
  if (req.body.isActive === undefined) {
    payload.isActive = schedule.isActive;
  }

  Object.assign(schedule, payload);
  await schedule.save();

  const scope = req.body.updateScope || 'schedule'; // schedule | future
  const fromDate =
    req.body.fromDate || toDateStr(new Date(), schedule.timezone);

  if (scope === 'future' || scope === 'schedule') {
    await syncFutureOccurrences(schedule, fromDate);
    // Regenerate with new rules for future window
    if (schedule.isActive) {
      await deleteFutureOccurrences(schedule._id, fromDate);
      await generateForSchedule(schedule, { fromDateStr: fromDate });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Recurring schedule updated',
    data: schedule,
  });
});

// PATCH /api/recurring-tasks/:id/pause
const pauseSchedule = asyncHandler(async (req, res) => {
  const schedule = await RecurringSchedule.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!schedule) {
    res.status(404);
    throw new Error('Recurring schedule not found');
  }

  const fromDate = toDateStr(new Date(), schedule.timezone);
  // Keep past/today pending; remove only future incomplete beyond today
  const tomorrow = require('../utils/dateHelpers').addDaysToDateStr(fromDate, 1);
  await deleteFutureOccurrences(schedule._id, tomorrow);

  res.status(200).json({
    success: true,
    message: 'Recurring schedule paused',
    data: schedule,
  });
});

// PATCH /api/recurring-tasks/:id/resume
const resumeSchedule = asyncHandler(async (req, res) => {
  const schedule = await RecurringSchedule.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );
  if (!schedule) {
    res.status(404);
    throw new Error('Recurring schedule not found');
  }

  const generation = await generateForSchedule(schedule);

  res.status(200).json({
    success: true,
    message: 'Recurring schedule resumed',
    data: schedule,
    generation,
  });
});

// DELETE /api/recurring-tasks/:id
// query: mode=schedule|future  (default schedule = stop & delete all occurrences)
const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await RecurringSchedule.findById(req.params.id);
  if (!schedule) {
    res.status(404);
    throw new Error('Recurring schedule not found');
  }

  const mode = req.query.mode || 'schedule';
  const fromDate =
    req.query.fromDate || toDateStr(new Date(), schedule.timezone);

  let deletedOccurrences = 0;

  if (mode === 'future') {
    deletedOccurrences = await deleteFutureOccurrences(schedule._id, fromDate);
    schedule.isActive = false;
    await schedule.save();
  } else {
    deletedOccurrences = await deleteAllOccurrences(schedule._id);
    await schedule.deleteOne();
  }

  res.status(200).json({
    success: true,
    message:
      mode === 'future'
        ? 'Future occurrences stopped'
        : 'Recurring schedule deleted',
    deletedOccurrences,
  });
});

module.exports = {
  generateOccurrences,
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  pauseSchedule,
  resumeSchedule,
  deleteSchedule,
};
