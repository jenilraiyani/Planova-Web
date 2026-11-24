import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useUI } from '../context/UIContext';
import { toInputDate, WEEKDAYS } from '../utils/helpers';

const defaultForm = {
  title: '',
  description: '',
  dueDate: '',
  dueTime: '09:00',
  priority: 'medium',
  status: 'todo',
  frequency: 'daily',
  selectedDays: [],
  interval: 1,
  intervalUnit: 'days',
  dayOfMonth: 1,
  startDate: '',
  endDate: '',
  editScope: 'occurrence',
};

const AddTaskModal = () => {
  const { modalOpen, editingTask, editingSchedule, forceRepeat, closeModal } = useUI();
  const { addTask, editTask, addRecurring, editSchedule, showToast } = useTasks();
  const isEditTask = Boolean(editingTask);
  const isEditSchedule = Boolean(editingSchedule);
  const isRecurringOccurrence = Boolean(editingTask?.isRecurringOccurrence);

  const [isRepeat, setIsRepeat] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultForm });

  const frequency = watch('frequency');
  const selectedDays = watch('selectedDays') || [];

  useEffect(() => {
    if (!modalOpen) return;

    if (editingSchedule) {
      setIsRepeat(true);
      reset({
        ...defaultForm,
        title: editingSchedule.title || '',
        description: editingSchedule.description || '',
        priority: editingSchedule.priority || 'medium',
        frequency: editingSchedule.frequency || 'daily',
        selectedDays: editingSchedule.selectedDays || [],
        interval: editingSchedule.interval || 1,
        intervalUnit: editingSchedule.intervalUnit || 'days',
        dayOfMonth: editingSchedule.dayOfMonth || 1,
        startDate: toInputDate(editingSchedule.startDate),
        dueTime: editingSchedule.dueTime || '09:00',
        endDate: toInputDate(editingSchedule.endDate),
        editScope: 'schedule',
      });
    } else if (editingTask) {
      setIsRepeat(false);
      reset({
        ...defaultForm,
        title: editingTask.title || '',
        description: editingTask.description || '',
        dueDate: toInputDate(editingTask.dueDate),
        dueTime: editingTask.dueTime || '09:00',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'todo',
        editScope: 'occurrence',
      });
    } else {
      setIsRepeat(Boolean(forceRepeat));
      const today = toInputDate(new Date());
      reset({
        ...defaultForm,
        startDate: today,
        dueDate: today,
        dueTime: '09:00',
      });
    }
  }, [modalOpen, editingTask, editingSchedule, forceRepeat, reset]);

  const toggleDay = (day) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort();
    setValue('selectedDays', next, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      if (isEditSchedule || (isRepeat && !isEditTask)) {
        if (['weekly', 'custom_days'].includes(data.frequency) && !data.selectedDays?.length) {
          showToast('Select at least one weekday', 'error');
          return;
        }

        const payload = {
          title: data.title.trim(),
          description: data.description?.trim() || '',
          priority: data.priority,
          frequency: data.frequency,
          selectedDays: data.selectedDays || [],
          interval: Number(data.interval) || 1,
          intervalUnit: data.intervalUnit,
          dayOfMonth: Number(data.dayOfMonth) || 1,
          startDate: data.startDate,
          dueTime: data.dueTime || '09:00',
          endDate: data.endDate || null,
          updateScope: 'schedule',
        };

        if (isEditSchedule) {
          await editSchedule(editingSchedule._id, payload);
        } else {
          await addRecurring(payload);
        }
      } else if (isEditTask) {
        const payload = {
          title: data.title.trim(),
          description: data.description?.trim() || '',
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate || null,
          dueTime: data.dueTime || null,
          editScope: isRecurringOccurrence ? data.editScope : 'occurrence',
        };
        await editTask(editingTask._id, payload);
      } else {
        await addTask({
          title: data.title.trim(),
          description: data.description?.trim() || '',
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate || null,
          dueTime: data.dueTime || null,
        });
      }
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const showRepeatFields = isRepeat && !isEditTask;
  const modalTitle = isEditSchedule
    ? 'Edit Recurring Schedule'
    : isEditTask
      ? 'Edit Task'
      : isRepeat
        ? 'Create Recurring Task'
        : 'Create New Task';

  return (
    <AnimatePresence>
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-deep-purple/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[18px] border border-border bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card sm:max-w-lg sm:rounded-[18px]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-5 py-4 backdrop-blur dark:border-dark-border dark:bg-dark-card/95">
              <h2 className="font-display text-xl font-semibold text-text-main dark:text-dark-text">
                {modalTitle}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-text-secondary hover:bg-bg dark:hover:bg-dark-bg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                  Task Title <span className="text-danger">*</span>
                </label>
                <input
                  {...register('title', {
                    required: 'Title is required',
                    maxLength: { value: 200, message: 'Title is too long' },
                  })}
                  placeholder="What needs to be done?"
                  className={`w-full rounded-[12px] border bg-bg px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 dark:bg-dark-bg dark:text-dark-text ${
                    errors.title
                      ? 'border-danger'
                      : 'border-border focus:border-primary dark:border-dark-border'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Add more details (optional)"
                  className="w-full resize-none rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                />
              </div>

              {!showRepeatFields && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                      Due Date
                    </label>
                    <input
                      type="date"
                      {...register('dueDate')}
                      className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                      Due Time
                    </label>
                    <input
                      type="time"
                      {...register('dueTime')}
                      className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                {!showRepeatFields && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Recurring edit scope */}
              {isRecurringOccurrence && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                    Apply changes to
                  </label>
                  <select
                    {...register('editScope')}
                    className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                  >
                    <option value="occurrence">Only this occurrence</option>
                    <option value="future">This and future occurrences</option>
                    <option value="schedule">Entire recurring schedule</option>
                  </select>
                </div>
              )}

              {/* Repeat toggle (create only) */}
              {!isEditTask && !isEditSchedule && (
                <button
                  type="button"
                  onClick={() => setIsRepeat((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-[14px] border-2 px-4 py-3 text-left transition ${
                    isRepeat
                      ? 'border-primary bg-lavender/20 dark:border-dark-primary dark:bg-dark-primary/20'
                      : 'border-border hover:border-lavender dark:border-dark-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/15 text-primary dark:text-dark-lavender">
                      <Repeat className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main dark:text-dark-text">
                        Repeat Task
                      </p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                        Create a recurring schedule
                      </p>
                    </div>
                  </div>
                  <span
                    className={`h-5 w-9 rounded-full p-0.5 transition ${
                      isRepeat ? 'bg-primary' : 'bg-border dark:bg-dark-border'
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white shadow transition ${
                        isRepeat ? 'translate-x-4' : ''
                      }`}
                    />
                  </span>
                </button>
              )}

              {/* Recurrence settings */}
              <AnimatePresence>
                {(showRepeatFields || isEditSchedule) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden rounded-[14px] border border-lavender/40 bg-lavender/10 p-4 dark:border-dark-primary/30 dark:bg-dark-primary/10"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                          Start Date
                        </label>
                        <input
                          type="date"
                          {...register('startDate', { required: showRepeatFields || isEditSchedule })}
                          className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                          Due Time
                        </label>
                        <input
                          type="time"
                          {...register('dueTime')}
                          className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                        Frequency
                      </label>
                      <select
                        {...register('frequency')}
                        className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekdays">Weekdays (Mon–Fri)</option>
                        <option value="weekends">Weekends (Sat–Sun)</option>
                        <option value="weekly">Weekly</option>
                        <option value="custom_days">Custom Days</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom_interval">Custom Interval</option>
                      </select>
                    </div>

                    {(frequency === 'weekly' || frequency === 'custom_days') && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-main dark:text-dark-text">
                          {frequency === 'weekly' ? 'Select weekday' : 'Select days'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {WEEKDAYS.map((day) => {
                            const active = selectedDays.includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => {
                                  if (frequency === 'weekly') {
                                    setValue('selectedDays', [day.value]);
                                  } else {
                                    toggleDay(day.value);
                                  }
                                }}
                                className={`h-9 min-w-9 rounded-[10px] px-2 text-xs font-semibold transition ${
                                  active
                                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                                    : 'border border-border bg-white text-text-secondary hover:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-secondary'
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {frequency === 'monthly' && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                          Day of month
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          {...register('dayOfMonth')}
                          className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                        />
                      </div>
                    )}

                    {frequency === 'custom_interval' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                            Every
                          </label>
                          <input
                            type="number"
                            min={1}
                            {...register('interval')}
                            className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                            Unit
                          </label>
                          <select
                            {...register('intervalUnit')}
                            className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                          >
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-dark-text">
                        End Date <span className="font-normal text-text-secondary">(optional)</span>
                      </label>
                      <input
                        type="date"
                        {...register('endDate')}
                        className="w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-[12px] border border-border px-4 py-2.5 text-sm font-medium text-text-main transition hover:bg-bg dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-60 dark:bg-dark-primary"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : isEditSchedule || isEditTask
                      ? 'Save Changes'
                      : isRepeat
                        ? 'Create Schedule'
                        : 'Save Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
