import mongoose from 'mongoose';

const roadmapTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
});

const roadmapDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dateStr: { type: String, required: true }, // YYYY-MM-DD
  title: { type: String, required: true },
  tasks: [roadmapTaskSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    rawContent: {
      type: String,
      default: '',
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    category: {
      type: String,
      default: 'Learning',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    days: [roadmapDaySchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
