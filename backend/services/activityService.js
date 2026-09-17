import { ActivityEvent } from '../models/ActivityEvent.js';
import { User } from '../models/User.js';
import { UserAchievement, Achievement } from '../models/Achievement.js';
import { Notification } from '../models/Notification.js';

/**
 * Record a user activity event, update XP/Level, recalculate streaks, and check achievements.
 */
export const recordActivityEvent = async ({
  userId,
  eventType,
  referenceId = null,
  referenceType = '',
  title,
  impactScore = 1,
  metadata = {},
  dateStr = null,
}) => {
  try {
    const todayStr = dateStr || new Date().toISOString().split('T')[0];

    // 1. Create Activity Event record
    const activity = await ActivityEvent.create({
      userId,
      eventType,
      referenceId,
      referenceType,
      title,
      impactScore,
      dateStr: todayStr,
      metadata,
    });

    // 2. Award XP & update level
    const xpGained = impactScore * 15;
    const user = await User.findById(userId);
    if (!user) return activity;

    user.xp = (user.xp || 0) + xpGained;
    const newLevel = Math.floor(user.xp / 100) + 1;
    let leveledUp = false;

    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;
      // Trigger Level Up notification
      await Notification.create({
        userId,
        title: `🎉 Level Up! You reached Level ${newLevel}`,
        message: `Outstanding consistency! Keep grinding and staying focused.`,
        type: 'achievement',
      });
    }

    // 3. Recalculate Streak
    await updateStreak(user, todayStr);

    await user.save();

    // 4. Check & Unlock Achievements
    await checkAchievements(userId, user);

    return { activity, xpGained, leveledUp, level: user.level, streak: user.currentStreak };
  } catch (error) {
    console.error('Error in recordActivityEvent:', error);
    throw error;
  }
};

/**
 * Recalculate consecutive active days (streak).
 */
const updateStreak = async (user, todayStr) => {
  // Get all unique dates with activity events for user sorted descending
  const activeDates = await ActivityEvent.distinct('dateStr', { userId: user._id });
  const sortedDates = activeDates.sort((a, b) => new Date(b) - new Date(a));

  if (sortedDates.length === 0) {
    user.currentStreak = 0;
    return;
  }

  let streak = 0;
  let currentDate = new Date(todayStr);

  // Check if today or yesterday has activity to maintain active streak
  const hasToday = sortedDates.includes(todayStr);
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const hasYesterday = sortedDates.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    user.currentStreak = 0;
    return;
  }

  // Count backwards day-by-day
  let checkDate = hasToday ? currentDate : yesterday;

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (sortedDates.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  user.currentStreak = streak;
  if (streak > (user.longestStreak || 0)) {
    user.longestStreak = streak;
  }
};

/**
 * Check and unlock achievements
 */
const checkAchievements = async (userId, user) => {
  const achievements = [
    {
      key: 'FIRST_TASK',
      title: 'First Step',
      description: 'Completed your first productivity task',
      badgeIcon: 'check-circle',
      xpReward: 50,
      category: 'Tasks',
      condition: async () => {
        const count = await ActivityEvent.countDocuments({ userId, eventType: 'TASK_COMPLETED' });
        return count >= 1;
      },
    },
    {
      key: 'STREAK_7',
      title: '7 Day Streak',
      description: 'Maintained 7 consecutive active days',
      badgeIcon: 'flame',
      xpReward: 150,
      category: 'Streak',
      condition: async () => user.currentStreak >= 7,
    },
    {
      key: 'STREAK_30',
      title: '30 Day Legend',
      description: 'Maintained 30 consecutive active days',
      badgeIcon: 'zap',
      xpReward: 500,
      category: 'Streak',
      condition: async () => user.currentStreak >= 30,
    },
    {
      key: 'CODING_50',
      title: 'Master Coder',
      description: 'Completed 50 coding or technical tasks',
      badgeIcon: 'code',
      xpReward: 300,
      category: 'Tasks',
      condition: async () => {
        const count = await ActivityEvent.countDocuments({
          userId,
          eventType: 'TASK_COMPLETED',
          'metadata.category': 'Code',
        });
        return count >= 50;
      },
    },
    {
      key: 'FOCUS_50_HOURS',
      title: 'Deep Work Master',
      description: 'Logged 50 total focus hours',
      badgeIcon: 'clock',
      xpReward: 400,
      category: 'Focus',
      condition: async () => {
        const events = await ActivityEvent.find({ userId, eventType: 'FOCUS_COMPLETED' });
        const totalMinutes = events.reduce((sum, e) => sum + (e.metadata.durationMinutes || 0), 0);
        return totalMinutes >= 3000; // 50 hours
      },
    },
    {
      key: 'PROJECT_COMPLETED',
      title: 'Finisher',
      description: 'Successfully completed a major project',
      badgeIcon: 'award',
      xpReward: 250,
      category: 'Projects',
      condition: async () => {
        const count = await ActivityEvent.countDocuments({ userId, eventType: 'PROJECT_COMPLETED' });
        return count >= 1;
      },
    },
  ];

  for (const ach of achievements) {
    const existing = await UserAchievement.findOne({ userId, achievementKey: ach.key });
    if (!existing) {
      const met = await ach.condition();
      if (met) {
        await UserAchievement.create({ userId, achievementKey: ach.key });
        user.xp += ach.xpReward;
        await Notification.create({
          userId,
          title: `🏆 Achievement Unlocked: ${ach.title}`,
          message: ach.description,
          type: 'achievement',
        });
        // Create activity event for unlock
        await ActivityEvent.create({
          userId,
          eventType: 'ACHIEVEMENT_UNLOCKED',
          title: `Unlocked achievement: ${ach.title}`,
          impactScore: 3,
          dateStr: new Date().toISOString().split('T')[0],
          metadata: { achievementKey: ach.key },
        });
      }
    }
  }
};
