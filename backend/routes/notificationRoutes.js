import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  subscribePush,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.post('/subscribe', subscribePush);

export default router;
