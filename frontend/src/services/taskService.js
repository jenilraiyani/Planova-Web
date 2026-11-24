import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTasks = async (params = {}) => {
  const { data } = await api.get('/tasks', { params });
  return data;
};

export const getTask = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
};

export const getTodayTasks = async () => {
  const { data } = await api.get('/tasks/today');
  return data;
};

export const createTask = async (taskData) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

export const updateTask = async (id, taskData) => {
  const { data } = await api.put(`/tasks/${id}`, taskData);
  return data;
};

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status });
  return data;
};

export const deleteTask = async (id, scope = 'occurrence') => {
  const { data } = await api.delete(`/tasks/${id}`, {
    params: { scope },
  });
  return data;
};

export const deleteAllTasks = async () => {
  const { data } = await api.delete('/tasks');
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export default api;
