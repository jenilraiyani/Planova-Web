const Task = require('../models/Task');
const RecurringSchedule = require('../models/RecurringSchedule');
const {
  toDateStr,
  addDaysToDateStr,
  compareDateStr,
  daysBetween,
  weekdayFromDateStr,
  combineDateAndTime,
} = require('../utils/dateHelpers');

const LOOKAHEAD_DAYS = 14;
const BACKFILL_DAYS = 30;

const matchesFrequency = (dateStr, schedule) => {
  const weekday = weekdayFromDateStr(dateStr);
  const startStr = toDateStr(new Date(schedule.startDate), schedule.timezone);

  if (compareDateStr(dateStr, startStr) < 0) return false;
  if (schedule.endDate) {
    const endStr = toDateStr(new Date(schedule.endDate), schedule.timezone);
    if (compareDateStr(dateStr, endStr) > 0) return false;
  }

  switch (schedule.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return weekday >= 1 && weekday <= 5;
    case 'weekends':
      return weekday === 0 || weekday === 6;
    case 'weekly':
    case 'custom_days':
      return (schedule.selectedDays || []).includes(weekday);
    case 'monthly': {
      const day = Number(dateStr.split('-')[2]);
      return day === (schedule.dayOfMonth || 1);
    }
    case 'custom_interval': {
      const diff = daysBetween(startStr, dateStr);
      if (diff < 0) return false;
      const interval = Math.max(1, schedule.interval || 1);
      if (schedule.intervalUnit === 'weeks') {
        return diff % (interval * 7) === 0;
      }
      return diff % interval === 0;
    }
    default:
      return false;
  }
};

const buildOccurrencePayload = (schedule, dateStr) => ({
  title: schedule.title,
  description: schedule.description || '',
  priority: schedule.priority || 'medium',
  status: 'todo',
  dueTime: schedule.dueTime || '09:00',
  dueDate: combineDateAndTime(dateStr, schedule.dueTime || '09:00'),
  occurrenceDate: dateStr,
  recurringScheduleId: schedule._id,
  isRecurringOccurrence: true,
});

/**
 * Generate missing occurrences for one schedule from rangeStart..rangeEnd (inclusive).
 * Skips dates that already have a task (unique index + pre-check).
 */
const generateForSchedule = async (schedule, options = {}) => {
  if (!schedule || !schedule.isActive) {
    return { created: 0, skipped: 0 };
  }

  const tz = schedule.timezone || 'UTC';
  const todayStr = toDateStr(new Date(), tz);
  const startStr = toDateStr(new Date(schedule.startDate), tz);

  let rangeStart = options.fromDateStr || addDaysToDateStr(todayStr, -BACKFILL_DAYS);
  if (compareDateStr(rangeStart, startStr) < 0) rangeStart = startStr;

  let rangeEnd =
    options.toDateStr || addDaysToDateStr(todayStr, LOOKAHEAD_DAYS);
  if (schedule.endDate) {
    const endStr = toDateStr(new Date(schedule.endDate), tz);
    if (compareDateStr(rangeEnd, endStr) > 0) rangeEnd = endStr;
  }

  if (compareDateStr(rangeStart, rangeEnd) > 0) {
    return { created: 0, skipped: 0 };
  }

  const existing = await Task.find({
    recurringScheduleId: schedule._id,
    occurrenceDate: { $gte: rangeStart, $lte: rangeEnd },
  }).select('occurrenceDate');

  const existingSet = new Set(existing.map((t) => t.occurrenceDate));

  const toInsert = [];
  let cursor = rangeStart;
  while (compareDateStr(cursor, rangeEnd) <= 0) {
    if (matchesFrequency(cursor, schedule) && !existingSet.has(cursor)) {
      toInsert.push(buildOccurrencePayload(schedule, cursor));
    }
    cursor = addDaysToDateStr(cursor, 1);
  }

  let created = 0;
  let skipped = 0;

  for (const doc of toInsert) {
    try {
      await Task.create(doc);
      created += 1;
    } catch (err) {
      if (err.code === 11000) {
        skipped += 1;
      } else {
        throw err;
      }
    }
  }

  return { created, skipped };
};

const generateAllActive = async () => {
  const schedules = await RecurringSchedule.find({ isActive: true });
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const schedule of schedules) {
    const result = await generateForSchedule(schedule);
    totalCreated += result.created;
    totalSkipped += result.skipped;
  }

  return {
    schedules: schedules.length,
    created: totalCreated,
    skipped: totalSkipped,
  };
};

/**
 * After schedule field updates, sync future incomplete occurrences' metadata.
 */
const syncFutureOccurrences = async (schedule, fromDateStr) => {
  const tz = schedule.timezone || 'UTC';
  const from = fromDateStr || toDateStr(new Date(), tz);

  await Task.updateMany(
    {
      recurringScheduleId: schedule._id,
      occurrenceDate: { $gte: from },
      status: { $ne: 'completed' },
    },
    {
      $set: {
        title: schedule.title,
        description: schedule.description || '',
        priority: schedule.priority,
        dueTime: schedule.dueTime,
      },
    }
  );

  // Recompute dueDate for matching docs
  const tasks = await Task.find({
    recurringScheduleId: schedule._id,
    occurrenceDate: { $gte: from },
    status: { $ne: 'completed' },
  });

  for (const task of tasks) {
    task.dueDate = combineDateAndTime(task.occurrenceDate, schedule.dueTime);
    await task.save();
  }
};

/**
 * Delete future incomplete occurrences from a date (inclusive).
 */
const deleteFutureOccurrences = async (scheduleId, fromDateStr) => {
  const result = await Task.deleteMany({
    recurringScheduleId: scheduleId,
    occurrenceDate: { $gte: fromDateStr },
    status: { $ne: 'completed' },
  });
  return result.deletedCount;
};

const deleteAllOccurrences = async (scheduleId) => {
  const result = await Task.deleteMany({ recurringScheduleId: scheduleId });
  return result.deletedCount;
};

module.exports = {
  LOOKAHEAD_DAYS,
  BACKFILL_DAYS,
  matchesFrequency,
  generateForSchedule,
  generateAllActive,
  syncFutureOccurrences,
  deleteFutureOccurrences,
  deleteAllOccurrences,
};
