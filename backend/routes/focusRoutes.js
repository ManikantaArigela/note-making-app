import express from 'express';
import { logFocusSession, getFocusHistory } from '../controllers/focusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', logFocusSession);
router.get('/history', getFocusHistory);

export default router;
