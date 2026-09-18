import express from 'express';
import {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  addTaskToRoadmapDay,
  toggleDayCompletion,
  deleteRoadmap,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRoadmaps);
router.post('/generate', createRoadmap);
router.get('/:id', getRoadmapById);
router.post('/:id/add-task', addTaskToRoadmapDay);
router.patch('/:id/toggle-day', toggleDayCompletion);
router.delete('/:id', deleteRoadmap);

export default router;
