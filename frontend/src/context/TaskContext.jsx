import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as taskService from '../services/taskService';
import * as recurringService from '../services/recurringService';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const lastParamsRef = useRef({});

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const fetchTasks = useCallback(async (params = {}) => {
    try {
      setError(null);
      lastParamsRef.current = params;
      const res = await taskService.getTasks(params);
      setTasks(res.data || []);
      return res.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tasks';
      setError(msg);
      showToast(msg, 'error');
      return [];
    }
  }, [showToast]);

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const res = await taskService.getDashboardStats();
      setDashboard(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard';
      showToast(msg, 'error');
      return null;
    } finally {
      setDashboardLoading(false);
    }
  }, [showToast]);

  const fetchSchedules = useCallback(async () => {
    try {
      setSchedulesLoading(true);
      const res = await recurringService.getRecurringSchedules();
      setSchedules(res.data || []);
      return res.data || [];
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load schedules', 'error');
      return [];
    } finally {
      setSchedulesLoading(false);
    }
  }, [showToast]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await recurringService.generateOccurrences().catch(() => null);
    } catch {
      /* ignore */
    }
    await Promise.all([
      fetchTasks(lastParamsRef.current || {}),
      fetchDashboard(),
      fetchSchedules(),
    ]);
    setLoading(false);
  }, [fetchTasks, fetchDashboard, fetchSchedules]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addTask = async (taskData) => {
    const res = await taskService.createTask(taskData);
    showToast('Task created successfully');
    await refreshAll();
    return res.data;
  };

  const addRecurring = async (payload) => {
    const res = await recurringService.createRecurringSchedule({
      ...payload,
      timezone: recurringService.getUserTimezone(),
    });
    showToast('Recurring task created');
    await refreshAll();
    return res.data;
  };

  const editTask = async (id, taskData) => {
    const res = await taskService.updateTask(id, taskData);
    showToast('Task updated successfully');
    await refreshAll();
    return res.data;
  };

  const editSchedule = async (id, payload) => {
    const res = await recurringService.updateRecurringSchedule(id, {
      ...payload,
      timezone: recurringService.getUserTimezone(),
    });
    showToast('Schedule updated');
    await refreshAll();
    return res.data;
  };

  const removeTask = async (id, scope = 'occurrence') => {
    await taskService.deleteTask(id, scope);
    showToast(
      scope === 'schedule'
        ? 'Recurring schedule deleted'
        : scope === 'future'
          ? 'This and future occurrences stopped'
          : 'Task deleted successfully'
    );
    await refreshAll();
  };

  const pauseSchedule = async (id) => {
    await recurringService.pauseRecurringSchedule(id);
    showToast('Schedule paused');
    await refreshAll();
  };

  const resumeSchedule = async (id) => {
    await recurringService.resumeRecurringSchedule(id);
    showToast('Schedule resumed');
    await refreshAll();
  };

  const removeSchedule = async (id, mode = 'schedule') => {
    await recurringService.deleteRecurringSchedule(id, mode);
    showToast(mode === 'future' ? 'Future occurrences stopped' : 'Schedule deleted');
    await refreshAll();
  };

  const changeStatus = async (id, status) => {
    await taskService.updateTaskStatus(id, status);
    showToast(
      status === 'completed' ? 'Task marked as completed' : 'Task status updated'
    );
    await refreshAll();
  };

  const clearAllTasks = async () => {
    await taskService.deleteAllTasks();
    showToast('All tasks cleared');
    await refreshAll();
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await changeStatus(task._id, newStatus);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        dashboard,
        schedules,
        loading,
        dashboardLoading,
        schedulesLoading,
        error,
        toast,
        showToast,
        clearToast,
        fetchTasks,
        fetchDashboard,
        fetchSchedules,
        refreshAll,
        addTask,
        addRecurring,
        editTask,
        editSchedule,
        removeTask,
        removeSchedule,
        pauseSchedule,
        resumeSchedule,
        changeStatus,
        clearAllTasks,
        toggleComplete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
