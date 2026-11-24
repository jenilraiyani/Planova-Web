import { useEffect, useMemo, useState } from 'react';
import { LayoutList, LayoutGrid, Plus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';
import ConfirmDialog from '../components/ConfirmDialog';
import ScopeConfirmDialog from '../components/ScopeConfirmDialog';
import { useTasks } from '../context/TaskContext';
import { useUI } from '../context/UIContext';

const MyTasks = () => {
  const { tasks, loading, fetchTasks, toggleComplete, removeTask } = useTasks();
  const { openAddModal, openEditModal, searchQuery } = useUI();
  const [view, setView] = useState(
    () => localStorage.getItem('planova-view') || localStorage.getItem('taskora-view') || 'list'
  );
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem('planova-view', view);
  }, [view]);

  useEffect(() => {
    const prefs = JSON.parse(
      localStorage.getItem('planova-prefs') || localStorage.getItem('taskora-prefs') || '{}'
    );
    if (prefs.defaultView) setView(prefs.defaultView);
  }, []);

  useEffect(() => {
    fetchTasks({
      priority: priority || undefined,
      status: status || undefined,
      sort,
      search: searchQuery || undefined,
    });
  }, [priority, status, sort, searchQuery, fetchTasks]);

  const filteredCount = tasks.length;

  const handleDelete = async (scope = 'occurrence') => {
    if (!deleteTarget) return;
    await removeTask(deleteTarget._id, scope);
    setDeleteTarget(null);
  };

  const sortedHint = useMemo(() => {
    if (sort === '-createdAt') return 'Newest first';
    if (sort === 'createdAt') return 'Oldest first';
    if (sort === 'dueDate') return 'Due date ↑';
    if (sort === '-dueDate') return 'Due date ↓';
    return '';
  }, [sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-main dark:text-dark-text">
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
            {filteredCount} task{filteredCount !== 1 ? 's' : ''} · {sortedHint}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 dark:bg-dark-primary"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-card sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-[12px] border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-[12px] border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-[12px] border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        >
          <option value="-createdAt">Newest created</option>
          <option value="createdAt">Oldest created</option>
          <option value="dueDate">Due date (soonest)</option>
          <option value="-dueDate">Due date (latest)</option>
        </select>

        <div className="ml-auto flex rounded-[12px] border border-border p-1 dark:border-dark-border">
          <button
            onClick={() => setView('list')}
            className={`rounded-[10px] p-2 transition ${
              view === 'list'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-bg dark:hover:bg-dark-bg'
            }`}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`rounded-[10px] p-2 transition ${
              view === 'grid'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-bg dark:hover:bg-dark-bg'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        view={view}
        loading={loading}
        onToggle={toggleComplete}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
        emptyTitle="No tasks found"
        emptyMessage="Try adjusting filters or create a new task to get started."
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

export default MyTasks;
