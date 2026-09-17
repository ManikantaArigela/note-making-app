import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'long-term'],
      default: 'monthly',
    },
    targetValue: {
      type: Number,
      required: true,
      default: 100,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'tasks', // e.g. tasks, hours, problems, projects
    },
    deadline: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'achieved', 'archived'],
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

export const Goal = mongoose.model('Goal', goalSchema);
