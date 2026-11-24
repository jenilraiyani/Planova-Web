export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateLong = (date = new Date()) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const toInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

export const isOverdue = (date, status) => {
  if (!date || status === 'completed') return false;
  const due = new Date(date);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
};

export const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const statusLabel = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const priorityColors = {
  low: 'bg-emerald-50 text-success border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  medium: 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  high: 'bg-rose-50 text-danger border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

export const statusColors = {
  todo: 'bg-slate-100 text-text-secondary border-slate-200 dark:bg-dark-border/50 dark:text-dark-text-secondary dark:border-dark-border',
  in_progress: 'bg-lavender/30 text-primary border-lavender dark:bg-primary/20 dark:text-dark-lavender dark:border-dark-primary/40',
  completed: 'bg-emerald-50 text-success border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
};

export const WEEKDAYS = [
  { value: 0, label: 'Sun', full: 'Sunday' },
  { value: 1, label: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Fri', full: 'Friday' },
  { value: 6, label: 'Sat', full: 'Saturday' },
];

export const frequencyLabel = {
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  weekly: 'Weekly',
  custom_days: 'Custom Days',
  monthly: 'Monthly',
  custom_interval: 'Custom Interval',
};

export const formatDueTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

export const describeSchedule = (schedule) => {
  if (!schedule) return '';
  const freq = frequencyLabel[schedule.frequency] || schedule.frequency;
  const time = formatDueTime(schedule.dueTime);
  if (schedule.frequency === 'custom_days' || schedule.frequency === 'weekly') {
    const days = (schedule.selectedDays || [])
      .map((d) => WEEKDAYS.find((w) => w.value === d)?.label)
      .filter(Boolean)
      .join(', ');
    return `${freq}${days ? ` · ${days}` : ''}${time ? ` · ${time}` : ''}`;
  }
  if (schedule.frequency === 'monthly') {
    return `${freq} · Day ${schedule.dayOfMonth}${time ? ` · ${time}` : ''}`;
  }
  if (schedule.frequency === 'custom_interval') {
    return `Every ${schedule.interval} ${schedule.intervalUnit}${time ? ` · ${time}` : ''}`;
  }
  return `${freq}${time ? ` · ${time}` : ''}`;
};
