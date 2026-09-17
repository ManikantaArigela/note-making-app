import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskInitialState, setAddTaskInitialState] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openAddTask = useCallback((initialData = null) => {
    setAddTaskInitialState(initialData);
    setIsAddTaskOpen(true);
  }, []);

  const closeAddTask = useCallback(() => {
    setIsAddTaskOpen(false);
    setAddTaskInitialState(null);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const createTask = async (taskData) => {
    const { data } = await axiosClient.post('/tasks', taskData);
    triggerRefresh();
    return data;
  };

  const toggleTaskCompletion = async (taskId) => {
    const { data } = await axiosClient.patch(`/tasks/${taskId}/toggle`);
    triggerRefresh();
    return data;
  };

  const moveTask = async (taskId, target) => {
    const { data } = await axiosClient.patch(`/tasks/${taskId}/move`, { target });
    triggerRefresh();
    return data;
  };

  const deleteTask = async (taskId) => {
    await axiosClient.delete(`/tasks/${taskId}`);
    triggerRefresh();
  };

  return (
    <TaskContext.Provider
      value={{
        isAddTaskOpen,
        addTaskInitialState,
        openAddTask,
        closeAddTask,
        createTask,
        toggleTaskCompletion,
        moveTask,
        deleteTask,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
