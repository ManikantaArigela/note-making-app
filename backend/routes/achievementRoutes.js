import express from 'express';
import { getUserAchievements } from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getUserAchievements);

export default router;
