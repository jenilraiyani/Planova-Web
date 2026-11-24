const Task = require('../models/Task');
const RecurringSchedule = require('../models/RecurringSchedule');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  deleteFutureOccurrences,
  deleteAllOccurrences,
  syncFutureOccurrences,
  generateForSchedule,
} = require('../services/occurrenceGenerator');
const { toDateStr, combineDateAndTime } = require('../utils/dateHelpers');

const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const { priority, status, search, sort = '-createdAt' } = req.query;
  const filter = {};

  if (priority && ['low', 'medium', 'high'].includes(priority)) {
    filter.priority = priority;
  }

  if (status && ['todo', 'in_progress', 'completed'].includes(status)) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const allowedSort = ['createdAt', '-createdAt', 'dueDate', '-dueDate', 'title', '-title'];
  const sortBy = allowedSort.includes(sort) ? sort : '-createdAt';

  const tasks = await Task.find(filter).sort(sortBy);

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// GET /api/tasks/today
const getTodayTasks = asyncHandler(async (req, res) => {
  const start = getStartOfDay();
  const end = getEndOfDay();

  const tasks = await Task.find({
    dueDate: { $gte: start, $lte: end },
  }).sort({ priority: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, status, dueDate, dueTime } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Task title is required');
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || '',
    priority: priority || 'medium',
    status: status || 'todo',
    dueDate: dueDate || null,
    dueTime: dueTime || null,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

// PUT /api/tasks/:id
// editScope: occurrence | future | schedule (for recurring tasks)
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, priority, status, dueDate, dueTime, editScope = 'occurrence' } =
    req.body;

  let task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (title !== undefined) {
    if (!title.trim()) {
      res.status(400);
      throw new Error('Task title is required');
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (priority !== undefined) {
    task.priority = priority;
  }

  if (status !== undefined) {
    task.status = status;
  }

  if (dueDate !== undefined) {
    task.dueDate = dueDate || null;
  }

  if (dueTime !== undefined) {
    task.dueTime = dueTime || null;
    if (task.occurrenceDate && dueTime) {
      task.dueDate = combineDateAndTime(task.occurrenceDate, dueTime);
    }
  }

  await task.save();

  // Propagate to schedule / future if requested
  if (task.recurringScheduleId && editScope !== 'occurrence') {
    const schedule = await RecurringSchedule.findById(task.recurringScheduleId);
    if (schedule) {
      if (title !== undefined) schedule.title = task.title;
      if (description !== undefined) schedule.description = task.description;
      if (priority !== undefined) schedule.priority = task.priority;
      if (dueTime !== undefined) schedule.dueTime = task.dueTime || schedule.dueTime;
      await schedule.save();

      const fromDate =
        editScope === 'future'
          ? task.occurrenceDate || toDateStr(new Date(), schedule.timezone)
          : toDateStr(new Date(schedule.startDate), schedule.timezone);

      if (editScope === 'future') {
        await syncFutureOccurrences(schedule, fromDate);
      } else if (editScope === 'schedule') {
        await syncFutureOccurrences(schedule, fromDate);
        if (schedule.isActive) {
          await generateForSchedule(schedule);
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

// PATCH /api/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['todo', 'in_progress', 'completed'].includes(status)) {
    res.status(400);
    throw new Error('Valid status is required (todo, in_progress, completed)');
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  res.status(200).json({
    success: true,
    message: 'Task status updated',
    data: task,
  });
});

// DELETE /api/tasks/:id
// scope: occurrence | future | schedule
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const scope = req.query.scope || 'occurrence';
  let extraDeleted = 0;

  if (task.recurringScheduleId && scope !== 'occurrence') {
    const schedule = await RecurringSchedule.findById(task.recurringScheduleId);
    const tz = schedule?.timezone || 'UTC';
    const fromDate = task.occurrenceDate || toDateStr(new Date(), tz);

    if (scope === 'future') {
      extraDeleted = await deleteFutureOccurrences(task.recurringScheduleId, fromDate);
      if (schedule) {
        schedule.isActive = false;
        await schedule.save();
      }
      // occurrence itself already covered if fromDate includes it via deleteFutureOccurrences
      // but completed tasks are kept — still delete this one if not already removed
      await Task.findByIdAndDelete(task._id);
    } else if (scope === 'schedule') {
      extraDeleted = await deleteAllOccurrences(task.recurringScheduleId);
      if (schedule) await schedule.deleteOne();
    }
  } else {
    await task.deleteOne();
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: { extraDeleted },
  });
});

// DELETE /api/tasks
const deleteAllTasks = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({});

  res.status(200).json({
    success: true,
    message: 'All tasks cleared',
    deletedCount: result.deletedCount,
  });
});

module.exports = {
  getTasks,
  getTodayTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  deleteAllTasks,
};
