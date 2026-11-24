import { ClipboardList } from 'lucide-react';
import TaskCard from './TaskCard';

const TaskList = ({
  tasks = [],
  view = 'list',
  onToggle,
  onEdit,
  onDelete,
  emptyTitle = 'No tasks yet',
  emptyMessage = 'Create your first task to get started.',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border bg-white/60 px-6 py-16 text-center dark:border-dark-border dark:bg-dark-card/40">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lavender/30 dark:bg-dark-primary/20">
          <ClipboardList className="h-7 w-7 text-primary dark:text-dark-lavender" />
        </div>
        <h3 className="font-display text-lg font-semibold text-text-main dark:text-dark-text">
          {emptyTitle}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary dark:text-dark-text-secondary">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        view === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
          : 'space-y-3'
      }
    >
      {tasks.map((task, index) => (
        <TaskCard
          key={task._id}
          task={task}
          view={view}
          index={index}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
