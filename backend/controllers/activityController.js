import { ActivityEvent } from '../models/ActivityEvent.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { HabitCompletion } from '../models/HabitCompletion.js';

export const getHeatmapData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate start date (365 days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Aggregate ActivityEvents by dateStr
    const activities = await ActivityEvent.aggregate([
      {
        $match: {
          userId,
          dateStr: { $gte: startDateStr },
        },
      },
      {
        $group: {
          _id: '$dateStr',
          count: { $sum: 1 },
          totalImpact: { $sum: '$impactScore' },
          events: { $push: '$eventType' },
        },
      },
    ]);

    const activityMap = {};
    activities.forEach((act) => {
      const tasksCompleted = act.events.filter((e) => e === 'TASK_COMPLETED').length;
      const habitsCompleted = act.events.filter((e) => e === 'HABIT_COMPLETED').length;
      const focusCompleted = act.events.filter((e) => e === 'FOCUS_COMPLETED').length;
      const goalsCompleted = act.events.filter((e) => e === 'GOAL_COMPLETED').length;

      // Determine activity intensity (0..4)
      let intensity = 0;
      if (act.count > 0 && act.count <= 2) intensity = 1;
      else if (act.count > 2 && act.count <= 4) intensity = 2;
      else if (act.count > 4 && act.count <= 7) intensity = 3;
      else if (act.count > 7) intensity = 4;

      activityMap[act._id] = {
        date: act._id,
        count: act.count,
        totalImpact: act.totalImpact,
        intensity,
        tasksCompleted,
        habitsCompleted,
        focusCompleted,
        goalsCompleted,
      };
    });

    res.json(activityMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDayDetails = async (req, res) => {
  try {
    const { dateStr } = req.params;
    const userId = req.user._id;

    const events = await ActivityEvent.find({ userId, dateStr }).sort({ createdAt: -1 });
    const tasksCompleted = await Task.find({ userId, completedDateStr: dateStr, isCompleted: true });
    const focusSessions = await FocusSession.find({ userId, completedDateStr: dateStr });
    const habitCompletions = await HabitCompletion.find({ userId, date: dateStr }).populate('habitId', 'title');

    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.json({
      date: dateStr,
      events,
      tasksCompleted,
      focusSessions,
      totalFocusMinutes,
      habitCompletions,
      summary: {
        taskCount: tasksCompleted.length,
        focusMinutes: totalFocusMinutes,
        habitCount: habitCompletions.length,
        eventCount: events.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
