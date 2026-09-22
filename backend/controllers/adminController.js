import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';

export const getAdminStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Total Users count
    const totalUsers = await User.countDocuments();

    // Active Users Today (users active or updated today)
    const activeUsersToday = await User.countDocuments({
      $or: [
        { lastActiveDate: todayStr },
        { updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      ],
    });

    // Total Tasks across platform
    const totalTasks = await Task.countDocuments();
    const totalCompletedTasks = await Task.countDocuments({ isCompleted: true });

    // Total Focus Sessions across platform
    const totalFocusSessions = await FocusSession.countDocuments();

    // User Directory Summary
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      metrics: {
        totalUsers,
        activeUsersToday,
        totalTasks,
        totalCompletedTasks,
        totalFocusSessions,
      },
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching admin statistics' });
  }
};
