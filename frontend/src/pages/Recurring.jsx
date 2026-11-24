import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Repeat,
  Plus,
  Pause,
  Play,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import ScopeConfirmDialog from '../components/ScopeConfirmDialog';
import TaskList from '../components/TaskList';
import { useTasks } from '../context/TaskContext';
import { useUI } from '../context/UIContext';
import {
  describeSchedule,
  formatDate,
  priorityColors,
  priorityLabel,
} from '../utils/helpers';
import { getRecurringSchedule } from '../services/recurringService';

const Recurring = () => {
  const {
    schedules,
    schedulesLoading,
    pauseSchedule,
    resumeSchedule,
    removeSchedule,
    toggleComplete,
    removeTask,
  } = useTasks();
  const { openAddModal, openEditScheduleModal, openEditModal, searchQuery } = useUI();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [occurrences, setOccurrences] = useState([]);
  const [occLoading, setOccLoading] = useState(false);
  const [deleteOccTarget, setDeleteOccTarget] = useState(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const q = searchQuery.toLowerCase();
    return schedules.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [schedules, searchQuery]);

  const loadOccurrences = async (id) => {
    setSelectedId(id);
    setOccLoading(true);
    try {
      const res = await getRecurringSchedule(id);
      setOccurrences(res.data?.occurrences || []);
    } catch {
      setOccurrences([]);
    } finally {
      setOccLoading(false);
    }
  };

  const handleDeleteSchedule = async (mode) => {
    if (!deleteTarget) return;
    await removeSchedule(deleteTarget._id, mode);
    setDeleteTarget(null);
    if (selectedId === deleteTarget._id) {
      setSelectedId(null);
      setOccurrences([]);
    }
  };

  const handleDeleteOccurrence = async (scope) => {
    if (!deleteOccTarget) return;
    await removeTask(deleteOccTarget._id, scope);
    setDeleteOccTarget(null);
    if (selectedId) await loadOccurrences(selectedId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main dark:text-dark-text">
            Recurring Tasks
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
            Manage schedules and individual occurrences
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openAddModal({ repeat: true })}
          className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 dark:bg-dark-primary"
        >
          <Plus className="h-4 w-4" />
          New Recurring Task
        </motion.button>
      </div>

      {schedulesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border bg-white/60 px-6 py-16 text-center dark:border-dark-border dark:bg-dark-card/40">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lavender/30 dark:bg-dark-primary/20">
            <Repeat className="h-7 w-7 text-primary dark:text-dark-lavender" />
          </div>
          <h3 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
            No recurring schedules
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary dark:text-dark-text-secondary">
            Create a repeating task like daily exercise or weekday study sessions.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((schedule, index) => (
            <motion.div
              key={schedule._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-[14px] border bg-white p-5 shadow-sm transition dark:bg-dark-card ${
                selectedId === schedule._id
                  ? 'border-primary dark:border-dark-primary'
                  : 'border-border dark:border-dark-border'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  onClick={() => loadOccurrences(schedule._id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
                      {schedule.title}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        schedule.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-success dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-border bg-bg text-text-secondary dark:border-dark-border dark:bg-dark-bg'
                      }`}
                    >
                      {schedule.isActive ? 'Active' : 'Paused'}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityColors[schedule.priority]}`}
                    >
                      {priorityLabel[schedule.priority]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-primary dark:text-dark-lavender">
                    {describeSchedule(schedule)}
                  </p>
                  {schedule.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                      {schedule.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-secondary dark:text-dark-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Starts {formatDate(schedule.startDate)}
                    </span>
                    {schedule.endDate && <span>Ends {formatDate(schedule.endDate)}</span>}
                    <span>{schedule.counts?.pending || 0} pending</span>
                    <span>{schedule.counts?.completed || 0} completed</span>
                    <span>{schedule.counts?.upcoming || 0} upcoming</span>
                  </div>
                </button>

                <div className="flex flex-wrap gap-2">
                  {schedule.isActive ? (
                    <button
                      onClick={() => pauseSchedule(schedule._id)}
                      className="inline-flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-2 text-xs font-medium text-text-main hover:bg-bg dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
                    >
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => resumeSchedule(schedule._id)}
                      className="inline-flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-2 text-xs font-medium text-text-main hover:bg-bg dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
                    >
                      <Play className="h-3.5 w-3.5" /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => openEditScheduleModal(schedule)}
                    className="inline-flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-2 text-xs font-medium text-text-main hover:bg-bg dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(schedule)}
                    className="inline-flex items-center gap-1.5 rounded-[12px] border border-danger/30 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedId && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
            Occurrences
          </h2>
          <TaskList
            tasks={occurrences}
            loading={occLoading}
            onToggle={async (task) => {
              await toggleComplete(task);
              await loadOccurrences(selectedId);
            }}
            onEdit={openEditModal}
            onDelete={setDeleteOccTarget}
            emptyTitle="No occurrences yet"
            emptyMessage="Occurrences will appear here once the schedule generates them."
          />
        </section>
      )}

      <ScopeConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete recurring schedule?"
        message={`Choose how to handle "${deleteTarget?.title}".`}
        onCancel={() => setDeleteTarget(null)}
        options={[
          {
            value: 'future',
            label: 'Stop future occurrences only',
            primary: true,
            onClick: () => handleDeleteSchedule('future'),
          },
          {
            value: 'schedule',
            label: 'Delete entire schedule & all occurrences',
            danger: true,
            onClick: () => handleDeleteSchedule('schedule'),
          },
        ]}
      />

      <ScopeConfirmDialog
        open={Boolean(deleteOccTarget)}
        title="Delete occurrence?"
        message={
          deleteOccTarget?.isRecurringOccurrence
            ? `"${deleteOccTarget?.title}" is part of a recurring schedule.`
            : `Delete "${deleteOccTarget?.title}"?`
        }
        onCancel={() => setDeleteOccTarget(null)}
        options={
          deleteOccTarget?.isRecurringOccurrence
            ? [
                {
                  value: 'occurrence',
                  label: 'Delete only this occurrence',
                  primary: true,
                  onClick: () => handleDeleteOccurrence('occurrence'),
                },
                {
                  value: 'future',
                  label: 'Delete this & stop future occurrences',
                  onClick: () => handleDeleteOccurrence('future'),
                },
                {
                  value: 'schedule',
                  label: 'Delete entire recurring schedule',
                  danger: true,
                  onClick: () => handleDeleteOccurrence('schedule'),
                },
              ]
            : [
                {
                  value: 'occurrence',
                  label: 'Delete task',
                  danger: true,
                  onClick: () => handleDeleteOccurrence('occurrence'),
                },
              ]
        }
      />
    </div>
  );
};

export default Recurring;
