import api from './taskService';

export const getRecurringSchedules = async () => {
  const { data } = await api.get('/recurring-tasks');
  return data;
};

export const getRecurringSchedule = async (id) => {
  const { data } = await api.get(`/recurring-tasks/${id}`);
  return data;
};

export const createRecurringSchedule = async (payload) => {
  const { data } = await api.post('/recurring-tasks', payload);
  return data;
};

export const updateRecurringSchedule = async (id, payload) => {
  const { data } = await api.put(`/recurring-tasks/${id}`, payload);
  return data;
};

export const pauseRecurringSchedule = async (id) => {
  const { data } = await api.patch(`/recurring-tasks/${id}/pause`);
  return data;
};

export const resumeRecurringSchedule = async (id) => {
  const { data } = await api.patch(`/recurring-tasks/${id}/resume`);
  return data;
};

export const deleteRecurringSchedule = async (id, mode = 'schedule') => {
  const { data } = await api.delete(`/recurring-tasks/${id}`, {
    params: { mode },
  });
  return data;
};

export const generateOccurrences = async () => {
  const { data } = await api.post('/recurring-tasks/generate');
  return data;
};

export const getUserTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
