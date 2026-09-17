import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { Goal } from '../models/Goal.js';
import { recordActivityEvent } from '../services/activityService.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = new Date().toISOString().split('T')[0];

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

    const todayFocusSessions = await FocusSession.find({ userId, completedDateStr: todayStr });
    const todayFocusMinutes = todayFocusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

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

    const categoryAgg = await Task.aggregate([
      { $match: { userId, isCompleted: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryBreakdown = categoryAgg.map((item) => ({
      name: item._id || 'General',
      count: item.count,
    }));

    const goals = await Goal.find({ userId, status: 'in_progress' });
    const totalGoals = goals.length;
    const achievedGoals = await Goal.countDocuments({ userId, status: 'achieved' });

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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];

    const completedTasks = await Task.find({
      userId,
      completedDateStr: { $gte: startDateStr },
      isCompleted: true,
    });

    const unfinishedTasks = await Task.find({
      userId,
      isCompleted: false,
      $or: [
        { scheduledDate: { $lte: new Date().toISOString().split('T')[0] } },
        { scheduledDate: null },
      ],
    }).sort({ priority: -1, createdAt: -1 });

    const focusSessions = await FocusSession.find({
      userId,
      completedDateStr: { $gte: startDateStr },
    });

    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalScheduled = completedTasks.length + unfinishedTasks.length;
    const completionRate = totalScheduled > 0 ? Math.round((completedTasks.length / totalScheduled) * 100) : 0;

    res.json({
      period: 'Last 7 Days',
      completedTasksCount: completedTasks.length,
      unfinishedTasks,
      completionRate,
      focusHours: (totalFocusMinutes / 60).toFixed(1),
      currentStreak: req.user.currentStreak,
      insight: `You completed ${completedTasks.length} tasks over the last 7 days.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeWeeklyReset = async (req, res) => {
  try {
    const userId = req.user._id;
    const { priorities } = req.body; // Array of priority string titles

    const todayStr = new Date().toISOString().split('T')[0];

    // Create high-priority tasks for next week if priorities provided
    if (priorities && Array.isArray(priorities)) {
      const nextMon = new Date();
      nextMon.setDate(nextMon.getDate() + ((7 - nextMon.getDay() + 1) % 7 || 7));
      const nextMonStr = nextMon.toISOString().split('T')[0];

      for (const title of priorities) {
        if (title && title.trim()) {
          await Task.create({
            userId,
            title: title.trim(),
            category: 'Learning',
            priority: 'high',
            state: 'scheduled',
            scheduledDate: nextMonStr,
          });
        }
      }
    }

    // Record Activity Event for Weekly Reset Completion
    const activityData = await recordActivityEvent({
      userId,
      eventType: 'GOAL_COMPLETED',
      title: '🔄 Completed Weekly Reset & Planning',
      impactScore: 4,
      dateStr: todayStr,
    });

    res.json({
      message: 'Weekly Reset completed! Priorities set for next week 🚀',
      activityData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
