import express from 'express';
import { getHeatmapData, getDayDetails } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/heatmap', getHeatmapData);
router.get('/day/:dateStr', getDayDetails);

export default router;
