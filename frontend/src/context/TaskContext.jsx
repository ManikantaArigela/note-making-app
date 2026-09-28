import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskInitialState, setAddTaskInitialState] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openAddTask = useCallback((initialData = null) => {
    setEditingTask(null);
    setAddTaskInitialState(initialData);
    setIsAddTaskOpen(true);
  }, []);

  const openEditTask = useCallback((task) => {
    setAddTaskInitialState(null);
    setEditingTask(task);
    setIsAddTaskOpen(true);
  }, []);

  const closeAddTask = useCallback(() => {
    setIsAddTaskOpen(false);
    setAddTaskInitialState(null);
    setEditingTask(null);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Real-time Auto Sync: Polling when active + Instant sync on window focus
  useEffect(() => {
    let intervalId;

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerRefresh();
      }
    };

    // Auto sync every 15s when active tab
    intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        triggerRefresh();
      }
    }, 15000);

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [triggerRefresh]);

  const createTask = async (taskData) => {
    try {
      const { data } = await axiosClient.post('/tasks', taskData);
      triggerRefresh();
      return data;
    } catch (error) {
      console.error('[TaskContext Error]: Failed to create task:', error.message);
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const { data } = await axiosClient.put(`/tasks/${taskId}`, taskData);
      triggerRefresh();
      return data;
    } catch (error) {
      console.error('[TaskContext Error]: Failed to update task:', error.message);
      throw error;
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const { data } = await axiosClient.patch(`/tasks/${taskId}/toggle`);
      triggerRefresh();
      return data;
    } catch (error) {
      console.error('[TaskContext Error]: Failed to toggle task completion:', error.message);
      throw error;
    }
  };

  const moveTask = async (taskId, target) => {
    try {
      const { data } = await axiosClient.patch(`/tasks/${taskId}/move`, { target });
      triggerRefresh();
      return data;
    } catch (error) {
      console.error('[TaskContext Error]: Failed to move task:', error.message);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axiosClient.delete(`/tasks/${taskId}`);
      triggerRefresh();
    } catch (error) {
      console.error('[TaskContext Error]: Failed to delete task:', error.message);
      throw error;
    }
  };

  const deduplicateTasks = async () => {
    try {
      const { data } = await axiosClient.post('/tasks/deduplicate');
      triggerRefresh();
      return data;
    } catch (error) {
      console.error('[TaskContext Error]: Failed to deduplicate tasks:', error.message);
      throw error;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        isAddTaskOpen,
        addTaskInitialState,
        editingTask,
        openAddTask,
        openEditTask,
        closeAddTask,
        createTask,
        updateTask,
        toggleTaskCompletion,
        moveTask,
        deleteTask,
        deduplicateTasks,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);

