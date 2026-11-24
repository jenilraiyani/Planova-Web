const Task = require('../models/Task');
const RecurringSchedule = require('../models/RecurringSchedule');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateAllActive } = require('../services/occurrenceGenerator');
const { getStartOfDay, getEndOfDay, toDateStr } = require('../utils/dateHelpers');

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  // Ensure recurring occurrences exist (covers missed days while app was closed)
  await generateAllActive();

  const start = getStartOfDay();
  const end = getEndOfDay();
  const todayStr = toDateStr(new Date());

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    todayTasks,
    recentTasks,
    todayTaskList,
    recurringToday,
    recurringUpcoming,
    recurringCompleted,
    recurringPending,
    activeSchedules,
  ] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({ status: 'completed' }),
    Task.countDocuments({ status: { $in: ['todo', 'in_progress'] } }),
    Task.countDocuments({ dueDate: { $gte: start, $lte: end } }),
    Task.find().sort({ updatedAt: -1 }).limit(5),
    Task.find({ dueDate: { $gte: start, $lte: end } }).sort({
      priority: -1,
      createdAt: -1,
    }),
    Task.countDocuments({
      isRecurringOccurrence: true,
      $or: [
        { occurrenceDate: todayStr },
        { dueDate: { $gte: start, $lte: end } },
      ],
    }),
    Task.countDocuments({
      isRecurringOccurrence: true,
      status: { $ne: 'completed' },
      occurrenceDate: { $gt: todayStr },
    }),
    Task.countDocuments({
      isRecurringOccurrence: true,
      status: 'completed',
    }),
    Task.countDocuments({
      isRecurringOccurrence: true,
      status: { $in: ['todo', 'in_progress'] },
    }),
    RecurringSchedule.countDocuments({ isActive: true }),
  ]);

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStart = getStartOfDay(day);
    const dayEnd = getEndOfDay(day);

    const [completed, created] = await Promise.all([
      Task.countDocuments({
        status: 'completed',
        updatedAt: { $gte: dayStart, $lte: dayEnd },
      }),
      Task.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      }),
    ]);

    weeklyData.push({
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dayStart.toISOString().split('T')[0],
      completed,
      created,
    });
  }

  const upcomingRecurringList = await Task.find({
    isRecurringOccurrence: true,
    status: { $ne: 'completed' },
    occurrenceDate: { $gte: todayStr },
  })
    .sort({ occurrenceDate: 1, dueTime: 1 })
    .limit(8);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        todayTasks,
        completionRate,
      },
      recurringStats: {
        today: recurringToday,
        upcoming: recurringUpcoming,
        completed: recurringCompleted,
        pending: recurringPending,
        activeSchedules,
      },
      todayTaskList,
      recentTasks,
      upcomingRecurringList,
      weeklyData,
    },
  });
});

module.exports = { getDashboardStats };
