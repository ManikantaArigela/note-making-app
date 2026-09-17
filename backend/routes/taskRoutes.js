import express from 'express';
import {
  getTasks,
  getTodayTasks,
  getTomorrowTasks,
  getInboxTasks,
  createTask,
  toggleTaskCompletion,
  updateTask,
  moveTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.get('/tomorrow', getTomorrowTasks);
router.get('/inbox', getInboxTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskCompletion);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;
