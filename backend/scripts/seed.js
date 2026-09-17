import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Habit } from '../models/Habit.js';
import { Goal } from '../models/Goal.js';
import { ActivityEvent } from '../models/ActivityEvent.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing test data
    await User.deleteMany({ email: 'demo@example.com' });
    const user = await User.create({
      name: 'Manikanta Arigela',
      email: 'demo@example.com',
      password: 'password123',
      level: 3,
      xp: 280,
      currentStreak: 5,
      longestStreak: 12,
    });

    console.log(`Created seed user: ${user.name} (${user.email})`);

    const project1 = await Project.create({
      userId: user._id,
      title: 'CIEverse Project',
      description: 'Main product launch & architecture design',
      category: 'Development',
      color: '#6366f1',
    });

    const project2 = await Project.create({
      userId: user._id,
      title: 'Data Engineering',
      description: 'PostgreSQL, pipelines & ETL workflows',
      category: 'Learning',
      color: '#10b981',
    });

    const goal1 = await Goal.create({
      userId: user._id,
      title: 'Solve 200 DSA Problems',
      targetValue: 200,
      currentValue: 45,
      unit: 'problems',
      timeframe: 'long-term',
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Create Today Tasks
    await Task.create({
      userId: user._id,
      title: 'PostgreSQL Subqueries & Indexing',
      description: 'Practice complex joins and subqueries in psql',
      category: 'Code',
      priority: 'high',
      state: 'scheduled',
      scheduledDate: todayStr,
      dueTime: '19:00',
      estimatedDuration: 45,
      projectId: project2._id,
      goalId: goal1._id,
    });

    await Task.create({
      userId: user._id,
      title: 'Solve LeetCode Daily Challenge',
      category: 'Code',
      priority: 'medium',
      state: 'scheduled',
      scheduledDate: todayStr,
      dueTime: '20:00',
      estimatedDuration: 30,
      goalId: goal1._id,
    });

    await Task.create({
      userId: user._id,
      title: 'CIEverse API Endpoints Review',
      category: 'Work',
      priority: 'urgent',
      state: 'scheduled',
      scheduledDate: todayStr,
      dueTime: '21:00',
      estimatedDuration: 60,
      projectId: project1._id,
    });

    // Tomorrow Tasks
    await Task.create({
      userId: user._id,
      title: 'ML - Logistic Regression Deep Dive',
      category: 'Learning',
      priority: 'medium',
      state: 'scheduled',
      scheduledDate: tomorrowStr,
      estimatedDuration: 60,
    });

    await Task.create({
      userId: user._id,
      title: 'DSA Practice: Array Sliding Window',
      category: 'Code',
      priority: 'high',
      state: 'scheduled',
      scheduledDate: tomorrowStr,
      estimatedDuration: 45,
    });

    // Habits
    await Habit.create({
      userId: user._id,
      title: 'DSA Problem Solving',
      frequency: 'daily',
      currentStreak: 5,
      longestStreak: 12,
      color: '#3b82f6',
    });

    await Habit.create({
      userId: user._id,
      title: 'PostgreSQL Practice',
      frequency: 'daily',
      currentStreak: 3,
      longestStreak: 7,
      color: '#10b981',
    });

    // Seed Activity Events over the last 14 days for Heatmap test
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const count = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < count; j++) {
        await ActivityEvent.create({
          userId: user._id,
          eventType: 'TASK_COMPLETED',
          title: `Completed practice session ${j + 1}`,
          impactScore: 1,
          dateStr: dStr,
        });
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
