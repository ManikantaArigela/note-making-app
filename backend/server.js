import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, checkDBHealth } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import { ensureAdminUserExists } from './controllers/authController.js';
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
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Global Exception Handlers
process.on('uncaughtException', (err) => {
  console.error('[Fatal Uncaught Exception]:', err.stack || err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at Promise]:', promise, 'reason:', reason);
});

const app = express();

const allowedOrigins = [
  'https://worklog-five-delta.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    // Fallback: allow request origin
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbHealth = checkDBHealth();
  const uptimeSeconds = Math.floor(process.uptime());
  const statusCode = dbHealth.status === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    status: dbHealth.status,
    database: dbHealth,
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
  });
});

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
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Productivity Application API is running smoothly 🚀',
    dbState: checkDBHealth().state,
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUserExists();

    server = app.listen(PORT, () => {
      console.log(`[Server Running]: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server Startup Failure]:', err.message);
  }
};

startServer();

// Graceful Shutdown Handler
const shutdown = async (signal) => {
  console.log(`[Signal ${signal}]: Closing HTTP server and MongoDB connections...`);
  if (server) {
    server.close(async () => {
      console.log('[HTTP Server Closed]');
      await mongoose.connection.close(false);
      console.log('[MongoDB Connection Closed]');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

