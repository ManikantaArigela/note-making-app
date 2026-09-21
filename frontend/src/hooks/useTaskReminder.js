import { useEffect, useRef, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export const useTaskReminder = () => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const notifiedSetRef = useRef(new Set());

  // Load notified tasks from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('focusflow_notified_tasks');
      if (saved) {
        notifiedSetRef.current = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading notified tasks cache:', e);
    }
  }, []);

  const saveNotifiedSet = () => {
    try {
      sessionStorage.setItem('focusflow_notified_tasks', JSON.stringify(Array.from(notifiedSetRef.current)));
    } catch (e) {
      console.error('Error saving notified tasks cache:', e);
    }
  };

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported on this device/browser.');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        // Show test welcome notification
        sendNotification('🔔 Notifications Enabled!', {
          body: 'FocusFlow will now alert you for scheduled tasks on time on desktop & mobile.',
          tag: 'welcome-notification',
        });
      } else if (permission === 'denied') {
        alert('Notification permission was blocked. Please enable notifications in your browser settings.');
      }
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  }, []);

  const sendNotification = async (title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const defaultOptions = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: { url: '/' },
      ...options,
    };

    try {
      // Try ServiceWorker notification first (required for Android Chrome / Mobile PWA background alerts)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, defaultOptions);
          return;
        }
      }
      // Desktop Web Fallback
      new Notification(title, defaultOptions);
    } catch (e) {
      console.error('Error displaying notification:', e);
      try {
        new Notification(title, defaultOptions);
      } catch (err) {
        console.error('Fallback notification error:', err);
      }
    }
  };

  // Main task reminder checker function
  const checkTaskReminders = useCallback(async () => {
    if (!user || Notification.permission !== 'granted') return;

    try {
      const { data: tasks } = await axiosClient.get('/tasks/today');
      if (!Array.isArray(tasks)) return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const nowTotalMinutes = currentHours * 60 + currentMinutes;

      tasks.forEach((task) => {
        if (!task || task.isCompleted || !task.dueTime) return;

        // Parse dueTime ("HH:mm")
        const [dueH, dueM] = task.dueTime.split(':').map(Number);
        if (isNaN(dueH) || isNaN(dueM)) return;

        let dueTotalMinutes = dueH * 60 + dueM;

        // Apply reminder offset
        if (task.reminder === '10m') dueTotalMinutes -= 10;
        else if (task.reminder === '30m') dueTotalMinutes -= 30;
        else if (task.reminder === '1h') dueTotalMinutes -= 60;

        // Unique key for task reminder instance
        const reminderKey = `${task._id}_${task.scheduledDate || todayStr}_${dueTotalMinutes}`;

        // Check if task reminder time has arrived and hasn't been notified
        if (nowTotalMinutes >= dueTotalMinutes && !notifiedSetRef.current.has(reminderKey)) {
          // Trigger notification
          const timeFormatted = `${dueH.toString().padStart(2, '0')}:${dueM.toString().padStart(2, '0')}`;
          sendNotification(`⏰ Task Reminder: ${task.title}`, {
            body: `Due at ${timeFormatted} | Priority: ${task.priority.toUpperCase()} | Category: ${task.category}`,
            tag: reminderKey,
          });

          notifiedSetRef.current.add(reminderKey);
          saveNotifiedSet();
        }
      });
    } catch (err) {
      console.error('Error checking task reminders:', err);
    }
  }, [user]);

  // Set up periodic ticker every 20 seconds
  useEffect(() => {
    if (!user) return;

    checkTaskReminders();
    const interval = setInterval(checkTaskReminders, 20000);

    return () => clearInterval(interval);
  }, [user, checkTaskReminders]);

  return {
    permissionStatus,
    requestNotificationPermission,
    sendNotification,
    checkTaskReminders,
  };
};
