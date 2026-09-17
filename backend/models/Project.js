import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Development',
    },
    color: {
      type: String,
      default: '#3b82f6', // Hex color
    },
    icon: {
      type: String,
      default: 'folder',
    },
    deadline: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
