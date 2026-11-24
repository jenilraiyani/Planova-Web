import { motion } from 'framer-motion';
import { Check, Pencil, Trash2, Calendar, AlertCircle, Repeat } from 'lucide-react';
import {
  formatDate,
  formatDueTime,
  isOverdue,
  priorityColors,
  statusColors,
  priorityLabel,
  statusLabel,
} from '../utils/helpers';

const RecurringBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full border border-lavender bg-lavender/25 px-2 py-0.5 text-[11px] font-medium text-primary dark:border-dark-primary/40 dark:bg-dark-primary/20 dark:text-dark-lavender">
    <Repeat className="h-3 w-3" />
    Recurring
  </span>
);

const TaskCard = ({
  task,
  view = 'list',
  onToggle,
  onEdit,
  onDelete,
  index = 0,
}) => {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === 'completed';
  const timeLabel = task.dueTime ? formatDueTime(task.dueTime) : '';

  if (view === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`group flex flex-col rounded-[14px] border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-dark-card ${
          overdue
            ? 'border-danger/40 dark:border-danger/40'
            : 'border-border dark:border-dark-border'
        } ${done ? 'opacity-75' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => onToggle(task)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
              done
                ? 'border-success bg-success text-white'
                : 'border-border hover:border-primary dark:border-dark-border'
            }`}
            aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          >
            {done && <Check className="h-3 w-3" />}
          </button>
          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg hover:text-primary dark:hover:bg-dark-bg"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <h3
          className={`mt-3 font-display text-base font-semibold text-text-main dark:text-dark-text ${
            done ? 'line-through' : ''
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary dark:text-dark-text-secondary">
            {task.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {task.isRecurringOccurrence && <RecurringBadge />}
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityColors[task.priority]}`}
          >
            {priorityLabel[task.priority]}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors[task.status]}`}
          >
            {statusLabel[task.status]}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-text-secondary dark:text-dark-text-secondary">
          <span className={`flex items-center gap-1 ${overdue ? 'text-danger' : ''}`}>
            {overdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
            {timeLabel ? ` · ${timeLabel}` : ''}
          </span>
          <span>Created {formatDate(task.createdAt)}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3.5 shadow-sm transition hover:shadow-md dark:bg-dark-card ${
        overdue
          ? 'border-danger/40 dark:border-danger/40'
          : 'border-border dark:border-dark-border'
      } ${done ? 'opacity-75' : ''}`}
    >
      <button
        onClick={() => onToggle(task)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          done
            ? 'border-success bg-success text-white'
            : 'border-border hover:border-primary dark:border-dark-border'
        }`}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`truncate font-medium text-text-main dark:text-dark-text ${
              done ? 'line-through' : ''
            }`}
          >
            {task.title}
          </h3>
          {task.isRecurringOccurrence && <RecurringBadge />}
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityColors[task.priority]}`}
          >
            {priorityLabel[task.priority]}
          </span>
          <span
            className={`hidden rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${statusColors[task.status]}`}
          >
            {statusLabel[task.status]}
          </span>
          {overdue && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-danger">
              <AlertCircle className="h-3 w-3" /> Overdue
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-0.5 truncate text-sm text-text-secondary dark:text-dark-text-secondary">
            {task.description}
          </p>
        )}
      </div>

      <div className="hidden items-center gap-1 text-xs text-text-secondary dark:text-dark-text-secondary md:flex">
        <Calendar className="h-3.5 w-3.5" />
        {task.dueDate ? formatDate(task.dueDate) : '—'}
        {timeLabel ? ` · ${timeLabel}` : ''}
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onEdit(task)}
          className="rounded-lg p-2 text-text-secondary opacity-70 transition hover:bg-bg hover:text-primary group-hover:opacity-100 dark:hover:bg-dark-bg"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="rounded-lg p-2 text-text-secondary opacity-70 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;
