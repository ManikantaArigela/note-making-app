import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:id', updateGoalProgress);
router.delete('/:id', deleteGoal);

export default router;
