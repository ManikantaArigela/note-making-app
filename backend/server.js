import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import focusRoutes from './routes/focusRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/roadmaps', roadmapRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Productivity Application API is running smoothly 🚀' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server Running]: http://localhost:${PORT}`);
});
