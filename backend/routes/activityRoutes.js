import express from 'express';
import { getHeatmapData, getDayDetails, getActivityHistory } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/heatmap', getHeatmapData);
router.get('/history', getActivityHistory);
router.get('/day/:dateStr', getDayDetails);

export default router;
