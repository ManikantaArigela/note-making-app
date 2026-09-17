import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Work', 'Learning', 'Personal', 'Health', 'Code', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    state: {
      type: String,
      enum: ['inbox', 'scheduled', 'completed', 'overdue', 'archived'],
      default: 'inbox',
      index: true,
    },
    scheduledDate: {
      type: String, // YYYY-MM-DD format
      default: null,
      index: true,
    },
    dueTime: {
      type: String, // HH:mm format
      default: null,
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 30,
    },
    actualDuration: {
      type: Number, // in minutes
      default: 0,
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekday', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'none',
    },
    subtasks: [subtaskSchema],
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedDateStr: {
      type: String, // YYYY-MM-DD format for fast heatmap aggregation
      default: null,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    labels: [
      {
        type: String,
      },
    ],
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, state: 1, scheduledDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
