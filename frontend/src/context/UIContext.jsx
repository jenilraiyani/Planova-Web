import { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [forceRepeat, setForceRepeat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openAddModal = (opts = {}) => {
    setEditingTask(null);
    setEditingSchedule(null);
    setForceRepeat(Boolean(opts.repeat));
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditingSchedule(null);
    setForceRepeat(false);
    setModalOpen(true);
  };

  const openEditScheduleModal = (schedule) => {
    setEditingSchedule(schedule);
    setEditingTask(null);
    setForceRepeat(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setEditingSchedule(null);
    setForceRepeat(false);
  };

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        modalOpen,
        editingTask,
        editingSchedule,
        forceRepeat,
        openAddModal,
        openEditModal,
        openEditScheduleModal,
        closeModal,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
