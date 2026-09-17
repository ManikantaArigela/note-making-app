import { Goal } from '../models/Goal.js';
import { recordActivityEvent } from '../services/activityService.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, description, category, timeframe, targetValue, unit, deadline } = req.body;

    if (!title || !targetValue) {
      return res.status(400).json({ message: 'Title and target value are required' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description: description || '',
      category: category || 'General',
      timeframe: timeframe || 'monthly',
      targetValue: Number(targetValue),
      currentValue: 0,
      unit: unit || 'tasks',
      deadline: deadline || null,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoalProgress = async (req, res) => {
  try {
    const { currentValue, status } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (currentValue !== undefined) {
      goal.currentValue = Number(currentValue);
    }

    if (status) {
      goal.status = status;
    }

    const wasInProgress = goal.status === 'in_progress';
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'achieved';
    }

    await goal.save();

    if (goal.status === 'achieved' && wasInProgress) {
      await recordActivityEvent({
        userId: req.user._id,
        eventType: 'GOAL_COMPLETED',
        referenceId: goal._id,
        referenceType: 'Goal',
        title: `Achieved Goal: "${goal.title}"`,
        impactScore: 5,
      });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
