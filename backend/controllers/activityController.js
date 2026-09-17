import { ActivityEvent } from '../models/ActivityEvent.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { HabitCompletion } from '../models/HabitCompletion.js';

export const getHeatmapData = async (req, res) => {
  try {
    const userId = req.user._id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    const startDateStr = startDate.toISOString().split('T')[0];

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

export const getActivityHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, type } = req.query;

    // Fetch all ActivityEvents sorted descending
    const events = await ActivityEvent.find({ userId })
      .populate('referenceId')
      .sort({ createdAt: -1 })
      .limit(200);

    const completedTasks = await Task.find({ userId, isCompleted: true })
      .populate('projectId', 'title color')
      .sort({ completedAt: -1 });

    const focusSessions = await FocusSession.find({ userId })
      .populate('taskId', 'title')
      .populate('projectId', 'title color')
      .sort({ completedAt: -1 });

    const habitCompletions = await HabitCompletion.find({ userId })
      .populate('habitId', 'title color')
      .sort({ completedAt: -1 });

    // Collect all dates
    const dateMap = {};

    // Group tasks
    completedTasks.forEach((task) => {
      const d = task.completedDateStr || (task.completedAt ? task.completedAt.toISOString().split('T')[0] : 'Unknown');
      if (!dateMap[d]) dateMap[d] = { dateStr: d, tasks: [], focus: [], habits: [], events: [] };
      dateMap[d].tasks.push(task);
    });

    // Group focus
    focusSessions.forEach((f) => {
      const d = f.completedDateStr || (f.completedAt ? f.completedAt.toISOString().split('T')[0] : 'Unknown');
      if (!dateMap[d]) dateMap[d] = { dateStr: d, tasks: [], focus: [], habits: [], events: [] };
      dateMap[d].focus.push(f);
    });

    // Group habits
    habitCompletions.forEach((h) => {
      const d = h.date || (h.completedAt ? h.completedAt.toISOString().split('T')[0] : 'Unknown');
      if (!dateMap[d]) dateMap[d] = { dateStr: d, tasks: [], focus: [], habits: [], events: [] };
      dateMap[d].habits.push(h);
    });

    // Group events
    events.forEach((evt) => {
      const d = evt.dateStr || (evt.createdAt ? evt.createdAt.toISOString().split('T')[0] : 'Unknown');
      if (!dateMap[d]) dateMap[d] = { dateStr: d, tasks: [], focus: [], habits: [], events: [] };
      dateMap[d].events.push(evt);
    });

    // Convert map to array sorted descending by date
    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(b) - new Date(a));

    const historyGroups = sortedDates.map((dateStr) => {
      const g = dateMap[dateStr];
      const totalFocusMins = g.focus.reduce((sum, s) => sum + s.durationMinutes, 0);

      const dObj = new Date(dateStr);
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let formattedDate = dateStr;
      if (dateStr === todayStr) formattedDate = 'Today';
      else if (dateStr === yesterdayStr) formattedDate = 'Yesterday';
      else if (!isNaN(dObj.getTime())) {
        formattedDate = dObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      return {
        dateStr,
        formattedDate,
        summary: {
          taskCount: g.tasks.length,
          focusMinutes: totalFocusMins,
          focusHours: (totalFocusMins / 60).toFixed(1),
          habitCount: g.habits.length,
          eventCount: g.events.length,
        },
        tasks: g.tasks,
        focus: g.focus,
        habits: g.habits,
        events: g.events,
      };
    });

    res.json(historyGroups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
