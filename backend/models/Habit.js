import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    targetDaysPerWeek: {
      type: Number,
      default: 7,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#10b981',
    },
    icon: {
      type: String,
      default: 'activity',
    },
  },
  { timestamps: true }
);

export const Habit = mongoose.model('Habit', habitSchema);
