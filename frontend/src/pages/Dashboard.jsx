import { useMemo, useState } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock3,
  CalendarDays,
  Plus,
  Repeat,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import TaskList from '../components/TaskList';
import ConfirmDialog from '../components/ConfirmDialog';
import ScopeConfirmDialog from '../components/ScopeConfirmDialog';
import { useTasks } from '../context/TaskContext';
import { useUI } from '../context/UIContext';
import { formatDateLong } from '../utils/helpers';

const Dashboard = () => {
  const { dashboard, dashboardLoading, toggleComplete, removeTask } = useTasks();
  const { openAddModal, openEditModal, searchQuery } = useUI();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = dashboard?.stats || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    todayTasks: 0,
    completionRate: 0,
  };

  const recurringStats = dashboard?.recurringStats || {
    today: 0,
    upcoming: 0,
    completed: 0,
    pending: 0,
    activeSchedules: 0,
  };

  const todayTasks = useMemo(() => {
    const list = dashboard?.todayTaskList || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [dashboard, searchQuery]);

  const recentTasks = useMemo(() => {
    const list = dashboard?.recentTasks || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [dashboard, searchQuery]);

  const weeklyData = dashboard?.weeklyData || [];
  const hasChartData = weeklyData.some((d) => d.completed > 0 || d.created > 0);

  const upcomingRecurring = useMemo(() => {
    const list = dashboard?.upcomingRecurringList || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [dashboard, searchQuery]);

  const handleDelete = async (scope = 'occurrence') => {
    if (!deleteTarget) return;
    await removeTask(deleteTarget._id, scope);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[18px] border border-border bg-gradient-to-br from-white via-white to-lavender/30 p-6 shadow-sm dark:border-dark-border dark:from-dark-card dark:via-dark-card dark:to-dark-primary/20 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-main dark:text-dark-text sm:text-3xl">
              Welcome back!
            </h1>
            <p className="mt-1 text-text-secondary dark:text-dark-text-secondary">
              Let's get things done today.
            </p>
            <p className="mt-3 text-sm font-medium text-primary dark:text-dark-lavender">
              {formatDateLong()}
            </p>
            {!dashboardLoading && (
              <p className="mt-2 text-xs text-text-secondary dark:text-dark-text-secondary">
                Completion rate: {stats.completionRate}%
              </p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 dark:bg-dark-primary"
          >
            <Plus className="h-5 w-5" />
            Create New Task
          </motion.button>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardLoading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28" />)
        ) : (
          <>
            <StatCard
              icon={ListTodo}
              label="Total Tasks"
              value={stats.totalTasks}
              delay={0.05}
              accent="primary"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={stats.completedTasks}
              delay={0.1}
              accent="success"
            />
            <StatCard
              icon={Clock3}
              label="Pending"
              value={stats.pendingTasks}
              delay={0.15}
              accent="warning"
            />
            <StatCard
              icon={CalendarDays}
              label="Today's Tasks"
              value={stats.todayTasks}
              delay={0.2}
              accent="lavender"
            />
          </>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Today's Tasks */}
        <section className="space-y-4 xl:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
              Today's Tasks
            </h2>
          </div>
          <TaskList
            tasks={todayTasks}
            loading={dashboardLoading}
            onToggle={toggleComplete}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
            emptyTitle="Nothing due today"
            emptyMessage="You're all clear for today. Add a task with today's due date to see it here."
          />
        </section>

        {/* Chart */}
        <section className="xl:col-span-2">
          <div className="h-full rounded-[14px] border border-border bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
            <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
              Productivity Overview
            </h2>
            <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
              Last 7 days activity
            </p>
            {dashboardLoading ? (
              <div className="skeleton mt-6 h-52" />
            ) : hasChartData ? (
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0F4" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#827A91' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#827A91' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E8E0F4',
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="created" name="Created" fill="#B69AF7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#7656D6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-8 flex h-48 flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-text-main dark:text-dark-text">
                  Not enough data yet
                </p>
                <p className="mt-1 max-w-[220px] text-xs text-text-secondary dark:text-dark-text-secondary">
                  Create and complete tasks to see your weekly productivity chart.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recurring overview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-primary dark:text-dark-lavender" />
          <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
            Recurring Overview
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardLoading ? (
            [1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24" />)
          ) : (
            <>
              <StatCard icon={CalendarDays} label="Today's Recurring" value={recurringStats.today} accent="lavender" />
              <StatCard icon={Clock3} label="Upcoming Recurring" value={recurringStats.upcoming} accent="primary" />
              <StatCard icon={CheckCircle2} label="Completed Recurring" value={recurringStats.completed} accent="success" />
              <StatCard icon={ListTodo} label="Pending Recurring" value={recurringStats.pending} accent="warning" />
            </>
          )}
        </div>
        <TaskList
          tasks={upcomingRecurring}
          loading={dashboardLoading}
          onToggle={toggleComplete}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
          emptyTitle="No upcoming recurring tasks"
          emptyMessage="Create a recurring schedule to see upcoming occurrences here."
        />
      </section>

      {/* Recent */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
          Recent Tasks
        </h2>
        <TaskList
          tasks={recentTasks}
          loading={dashboardLoading}
          onToggle={toggleComplete}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
          emptyTitle="No recent activity"
          emptyMessage="Your recently updated tasks will appear here."
        />
      </section>

      {deleteTarget?.isRecurringOccurrence ? (
        <ScopeConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete recurring occurrence?"
          message={`"${deleteTarget?.title}" is part of a recurring schedule.`}
          onCancel={() => setDeleteTarget(null)}
          options={[
            {
              value: 'occurrence',
              label: 'Delete only this occurrence',
              primary: true,
              onClick: () => handleDelete('occurrence'),
            },
            {
              value: 'future',
              label: 'Delete this & stop future',
              onClick: () => handleDelete('future'),
            },
            {
              value: 'schedule',
              label: 'Delete entire schedule',
              danger: true,
              onClick: () => handleDelete('schedule'),
            },
          ]}
        />
      ) : (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete task?"
          message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete('occurrence')}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
