import express from 'express';
import {
  getHabits,
  createHabit,
  toggleHabitCompletion,
  deleteHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.post('/:id/toggle', toggleHabitCompletion);
router.delete('/:id', deleteHabit);

export default router;
