import { Task } from '../models/Task.js';
import { Goal } from '../models/Goal.js';
import { recordActivityEvent } from '../services/activityService.js';
import { handleTaskRecurrence } from '../services/taskRecurrenceService.js';

export const getTasks = async (req, res) => {
  try {
    const { state, date, projectId, goalId, category, priority, search, isCompleted } = req.query;
    const filter = { userId: req.user._id };

    if (state) filter.state = state;
    if (date) filter.scheduledDate = date;
    if (projectId) filter.projectId = projectId;
    if (goalId) filter.goalId = goalId;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'title color')
      .populate('goalId', 'title')
      .sort({ isCompleted: 1, priority: -1, scheduledDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayTasks = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Only return uncompleted tasks for today/overdue
    const tasks = await Task.find({
      userId: req.user._id,
      isCompleted: false,
      $or: [
        { scheduledDate: todayStr },
        { scheduledDate: { $lt: todayStr } },
      ],
    })
      .populate('projectId', 'title color')
      .populate('goalId', 'title')
      .sort({ priority: -1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTomorrowTasks = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tasks = await Task.find({
      userId: req.user._id,
      isCompleted: false,
      scheduledDate: tomorrowStr,
    })
      .populate('projectId', 'title color')
      .populate('goalId', 'title')
      .sort({ priority: -1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInboxTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      isCompleted: false,
      $or: [
        { state: 'inbox' },
        { scheduledDate: null },
        { repeat: { $ne: 'none' } },
      ],
    })
      .populate('projectId', 'title color')
      .populate('goalId', 'title')
      .sort({ repeat: -1, priority: -1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompletedTasks = async (req, res) => {
  try {
    const { category, projectId, search } = req.query;
    const filter = { userId: req.user._id, isCompleted: true };

    if (category) filter.category = category;
    if (projectId) filter.projectId = projectId;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'title color')
      .populate('goalId', 'title')
      .sort({ completedAt: -1, updatedAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      state,
      scheduledDate,
      dueTime,
      estimatedDuration,
      repeat,
      subtasks,
      projectId,
      goalId,
      labels,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    let calculatedState = state || 'inbox';
    if (scheduledDate) {
      calculatedState = 'scheduled';
    }

    const task = await Task.create({
      userId: req.user._id,
      title,
      description: description || '',
      category: category || 'General',
      priority: priority || 'medium',
      state: calculatedState,
      scheduledDate: scheduledDate || null,
      dueTime: dueTime || null,
      estimatedDuration: estimatedDuration || 30,
      repeat: repeat || 'none',
      subtasks: subtasks || [],
      projectId: projectId || null,
      goalId: goalId || null,
      labels: labels || [],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'title color')
      .populate('goalId', 'title');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (!task.isCompleted) {
      task.isCompleted = true;
      task.completedAt = new Date();
      task.completedDateStr = todayStr;
      task.state = 'completed';
      await task.save();

      const impactScore = task.priority === 'urgent' ? 3 : task.priority === 'high' ? 2 : 1;
      const activityData = await recordActivityEvent({
        userId: req.user._id,
        eventType: 'TASK_COMPLETED',
        referenceId: task._id,
        referenceType: 'Task',
        title: `Completed task: "${task.title}"`,
        impactScore,
        metadata: {
          category: task.category,
          priority: task.priority,
          projectId: task.projectId,
        },
      });

      const nextInstance = await handleTaskRecurrence(task);

      if (task.goalId) {
        await Goal.findByIdAndUpdate(task.goalId, { $inc: { currentValue: 1 } });
      }

      return res.json({
        task,
        activityData,
        nextInstance,
        message: 'Task completed!',
      });
    } else {
      task.isCompleted = false;
      task.completedAt = null;
      task.completedDateStr = null;
      task.state = task.scheduledDate ? 'scheduled' : 'inbox';
      await task.save();

      return res.json({ task, message: 'Task marked incomplete' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);

    if (req.body.scheduledDate && task.state === 'inbox') {
      task.state = 'scheduled';
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('projectId', 'title color')
      .populate('goalId', 'title');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { target } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (target === 'today') {
      task.scheduledDate = todayStr;
      task.state = 'scheduled';
    } else if (target === 'tomorrow') {
      task.scheduledDate = tomorrowStr;
      task.state = 'scheduled';
    } else if (target === 'inbox') {
      task.scheduledDate = null;
      task.state = 'inbox';
    } else {
      task.scheduledDate = target;
      task.state = 'scheduled';
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const batchRescheduleTasks = async (req, res) => {
  try {
    const { taskIds, target } = req.body;
    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ message: 'taskIds array is required' });
    }

    let targetDate = null;
    if (target === 'next_week') {
      const nextMon = new Date();
      nextMon.setDate(nextMon.getDate() + ((7 - nextMon.getDay() + 1) % 7 || 7));
      targetDate = nextMon.toISOString().split('T')[0];
    } else if (target === 'today') {
      targetDate = new Date().toISOString().split('T')[0];
    }

    await Task.updateMany(
      { _id: { $in: taskIds }, userId: req.user._id },
      {
        scheduledDate: targetDate,
        state: targetDate ? 'scheduled' : 'inbox',
      }
    );

    res.json({ message: `Rescheduled ${taskIds.length} tasks successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const batchCleanupTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ message: 'taskIds array is required' });
    }

    await Task.deleteMany({ _id: { $in: taskIds }, userId: req.user._id });
    res.json({ message: `Cleaned up ${taskIds.length} tasks` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
