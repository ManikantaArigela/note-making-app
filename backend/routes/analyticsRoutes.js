import express from 'express';
import { getDashboardAnalytics, getWeeklyReview, completeWeeklyReset } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/weekly-review', getWeeklyReview);
router.post('/weekly-reset', completeWeeklyReset);

export default router;
