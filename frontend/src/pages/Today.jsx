import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, CheckCircle2, Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';
import ConfirmDialog from '../components/ConfirmDialog';
import ScopeConfirmDialog from '../components/ScopeConfirmDialog';
import { getTodayTasks } from '../services/taskService';
import { useTasks } from '../context/TaskContext';
import { useUI } from '../context/UIContext';
import { formatDateLong } from '../utils/helpers';

const Today = () => {
  const { toggleComplete, removeTask, tasks } = useTasks();
  const { openAddModal, openEditModal, searchQuery } = useUI();
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadToday = async () => {
    try {
      setLoading(true);
      const res = await getTodayTasks();
      setTodayTasks(res.data || []);
    } catch {
      setTodayTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, [tasks]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return todayTasks;
    const q = searchQuery.toLowerCase();
    return todayTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [todayTasks, searchQuery]);

  const completed = filtered.filter((t) => t.status === 'completed').length;
  const pending = filtered.filter((t) => t.status !== 'completed').length;

  const handleDelete = async (scope = 'occurrence') => {
    if (!deleteTarget) return;
    await removeTask(deleteTarget._id, scope);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[18px] border border-border bg-gradient-to-r from-white to-lavender/25 p-6 dark:border-dark-border dark:from-dark-card dark:to-dark-primary/15 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/15 text-primary dark:bg-dark-primary/25 dark:text-dark-lavender">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-main dark:text-dark-text">
                Today
              </h1>
              <p className="mt-1 text-sm text-primary dark:text-dark-lavender">
                {formatDateLong()}
              </p>
              <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                {filtered.length} task{filtered.length !== 1 ? 's' : ''} scheduled today
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 dark:bg-dark-primary"
          >
            <Plus className="h-4 w-4" />
            Quick Add
          </motion.button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-[14px] bg-white/80 px-4 py-3 dark:bg-dark-bg/50">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Completed</p>
              <p className="font-display text-xl font-semibold text-text-main dark:text-dark-text">
                {completed}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[14px] bg-white/80 px-4 py-3 dark:bg-dark-bg/50">
            <Clock3 className="h-5 w-5 text-warning" />
            <div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pending</p>
              <p className="font-display text-xl font-semibold text-text-main dark:text-dark-text">
                {pending}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <TaskList
        tasks={filtered}
        loading={loading}
        onToggle={toggleComplete}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
        emptyTitle="No tasks for today"
        emptyMessage="Enjoy your free day — or add a task due today to fill your schedule."
      />

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

export default Today;
