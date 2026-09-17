import { Task } from '../models/Task.js';

/**
 * Handle recurrence logic when a task is completed.
 * If the task repeats, generate the next scheduled instance.
 */
export const handleTaskRecurrence = async (completedTask) => {
  if (!completedTask || completedTask.repeat === 'none') {
    return null;
  }

  const baseDate = completedTask.scheduledDate
    ? new Date(completedTask.scheduledDate)
    : new Date();

  let nextDate = new Date(baseDate);

  switch (completedTask.repeat) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'weekday':
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (nextDate.getDay() === 0 || nextDate.getDay() === 6); // 0 = Sun, 6 = Sat
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    case 'custom':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    default:
      return null;
  }

  const nextDateStr = nextDate.toISOString().split('T')[0];

  // Create next recurring instance
  const newTask = await Task.create({
    userId: completedTask.userId,
    title: completedTask.title,
    description: completedTask.description,
    category: completedTask.category,
    priority: completedTask.priority,
    state: 'scheduled',
    scheduledDate: nextDateStr,
    dueTime: completedTask.dueTime,
    estimatedDuration: completedTask.estimatedDuration,
    repeat: completedTask.repeat,
    projectId: completedTask.projectId,
    goalId: completedTask.goalId,
    labels: completedTask.labels,
    subtasks: completedTask.subtasks ? completedTask.subtasks.map((st) => ({ title: st.title, completed: false })) : [],
    parentTaskId: completedTask.parentTaskId || completedTask._id,
  });

  return newTask;
};
