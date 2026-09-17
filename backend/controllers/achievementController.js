import { UserAchievement } from '../models/Achievement.js';

export const getUserAchievements = async (req, res) => {
  try {
    const userAchievements = await UserAchievement.find({ userId: req.user._id });
    res.json(userAchievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
