import mongoose from 'mongoose';

const activityEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'TASK_COMPLETED',
        'HABIT_COMPLETED',
        'FOCUS_COMPLETED',
        'GOAL_COMPLETED',
        'PROJECT_COMPLETED',
        'ACHIEVEMENT_UNLOCKED',
      ],
      required: true,
      index: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceType: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    impactScore: {
      type: Number,
      default: 1,
    },
    dateStr: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

activityEventSchema.index({ userId: 1, dateStr: 1 });

export const ActivityEvent = mongoose.model('ActivityEvent', activityEventSchema);
