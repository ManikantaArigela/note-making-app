import { Habit } from '../models/Habit.js';
import { HabitCompletion } from '../models/HabitCompletion.js';
import { recordActivityEvent } from '../services/activityService.js';

export const getHabits = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      habits.map(async (habit) => {
        const isCompletedToday = await HabitCompletion.exists({
          habitId: habit._id,
          date: todayStr,
        });
        const totalCompletions = await HabitCompletion.countDocuments({ habitId: habit._id });

        return {
          ...habit.toObject(),
          isCompletedToday: !!isCompletedToday,
          totalCompletions,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, targetDaysPerWeek, color, icon } = req.body;
    if (!title) return res.status(400).json({ message: 'Habit title is required' });

    const habit = await Habit.create({
      userId: req.user._id,
      title,
      description: description || '',
      frequency: frequency || 'daily',
      targetDaysPerWeek: targetDaysPerWeek || 7,
      color: color || '#10b981',
      icon: icon || 'activity',
    });

    res.status(201).json({ ...habit.toObject(), isCompletedToday: false, totalCompletions: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateStr } = req.body;
    const date = dateStr || new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const existing = await HabitCompletion.findOne({ habitId: habit._id, date });

    if (!existing) {
      // Complete habit
      await HabitCompletion.create({
        habitId: habit._id,
        userId: req.user._id,
        date,
      });

      habit.currentStreak = (habit.currentStreak || 0) + 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
      await habit.save();

      // Record activity event
      const activityData = await recordActivityEvent({
        userId: req.user._id,
        eventType: 'HABIT_COMPLETED',
        referenceId: habit._id,
        referenceType: 'Habit',
        title: `Completed habit: "${habit.title}"`,
        impactScore: 1,
        dateStr: date,
      });

      return res.json({ completed: true, habit, activityData });
    } else {
      // Uncomplete habit
      await HabitCompletion.deleteOne({ _id: existing._id });
      habit.currentStreak = Math.max(0, (habit.currentStreak || 1) - 1);
      await habit.save();

      return res.json({ completed: false, habit });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    await HabitCompletion.deleteMany({ habitId: habit._id });
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
