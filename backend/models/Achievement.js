import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    badgeIcon: {
      type: String,
      default: 'award',
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    category: {
      type: String,
      enum: ['Streak', 'Tasks', 'Focus', 'Projects', 'Goals', 'Habits'],
      default: 'Tasks',
    },
    threshold: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model('Achievement', achievementSchema);

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementKey: {
      type: String,
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

export const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);
