import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);

export default router;
