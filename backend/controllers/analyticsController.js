import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { Goal } from '../models/Goal.js';
import { HabitCompletion } from '../models/HabitCompletion.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Today's Tasks
    const todayTasks = await Task.find({
      userId,
      $or: [
        { scheduledDate: todayStr },
        { completedDateStr: todayStr, isCompleted: true },
        { scheduledDate: { $lt: todayStr }, isCompleted: false },
      ],
    });

    const totalTodayCount = todayTasks.length;
    const completedTodayCount = todayTasks.filter((t) => t.isCompleted).length;
    const todayCompletionRate = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

    // 2. Today's Focus Mins
    const todayFocusSessions = await FocusSession.find({ userId, completedDateStr: todayStr });
    const todayFocusMinutes = todayFocusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    // 3. Weekly Productivity (Last 7 Days)
    const weeklyData = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let bestDayName = 'Thursday';
    let maxDayCount = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];

      const tasksCompletedOnDay = await Task.countDocuments({
        userId,
        completedDateStr: dStr,
        isCompleted: true,
      });

      const focusSessionsOnDay = await FocusSession.find({ userId, completedDateStr: dStr });
      const focusMinsOnDay = focusSessionsOnDay.reduce((sum, s) => sum + s.durationMinutes, 0);

      weeklyData.push({
        day: dayName,
        date: dStr,
        completedTasks: tasksCompletedOnDay,
        focusHours: Number((focusMinsOnDay / 60).toFixed(1)),
      });

      if (tasksCompletedOnDay > maxDayCount) {
        maxDayCount = tasksCompletedOnDay;
        bestDayName = dayName;
      }
    }

    // 4. Task Category Breakdown
    const categoryAgg = await Task.aggregate([
      { $match: { userId, isCompleted: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryBreakdown = categoryAgg.map((item) => ({
      name: item._id || 'General',
      count: item.count,
    }));

    // 5. Goal Progress Overview
    const goals = await Goal.find({ userId, status: 'in_progress' });
    const totalGoals = goals.length;
    const achievedGoals = await Goal.countDocuments({ userId, status: 'achieved' });

    // 6. Productivity Insight Generator
    let insightText = '';
    if (completedTodayCount === totalTodayCount && totalTodayCount > 0) {
      insightText = '🔥 Perfect day! You completed 100% of your scheduled tasks today.';
    } else if (req.user.currentStreak >= 7) {
      insightText = `⚡ You are on a ${req.user.currentStreak}-day streak! Keep the momentum going strong.`;
    } else if (maxDayCount > 0) {
      insightText = `📈 ${bestDayName} is your peak productivity day with ${maxDayCount} completed tasks.`;
    } else {
      insightText = '💡 Start with just one small task to unlock your momentum for the day.';
    }

    res.json({
      todayStats: {
        totalTasks: totalTodayCount,
        completedTasks: completedTodayCount,
        completionRate: todayCompletionRate,
        focusMinutes: todayFocusMinutes,
        focusHours: (todayFocusMinutes / 60).toFixed(1),
        currentStreak: req.user.currentStreak,
        longestStreak: req.user.longestStreak,
      },
      weeklyData,
      categoryBreakdown,
      goalStats: {
        inProgress: totalGoals,
        achieved: achievedGoals,
      },
      productivityInsight: insightText,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyReview = async (req, res) => {
  try {
    const userId = req.user._id;

    // Start of week (7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];

    const completedTasks = await Task.find({
      userId,
      completedDateStr: { $gte: startDateStr },
      isCompleted: true,
    });

    const missedTasks = await Task.find({
      userId,
      scheduledDate: { $gte: startDateStr },
      isCompleted: false,
    });

    const focusSessions = await FocusSession.find({
      userId,
      completedDateStr: { $gte: startDateStr },
    });

    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const totalScheduled = completedTasks.length + missedTasks.length;
    const completionRate = totalScheduled > 0 ? Math.round((completedTasks.length / totalScheduled) * 100) : 0;

    res.json({
      period: 'Last 7 Days',
      tasksCompleted: completedTasks.length,
      missedTasks: missedTasks.length,
      completionRate,
      focusHours: (totalFocusMinutes / 60).toFixed(1),
      currentStreak: req.user.currentStreak,
      insight: `You completed ${completedTasks.length} tasks and logged ${(totalFocusMinutes / 60).toFixed(
        1
      )} focus hours over the last 7 days.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
