import express from 'express';
import {
  getTasks,
  getTodayTasks,
  getTomorrowTasks,
  getInboxTasks,
  getCompletedTasks,
  createTask,
  toggleTaskCompletion,
  updateTask,
  moveTask,
  batchRescheduleTasks,
  batchCleanupTasks,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.get('/tomorrow', getTomorrowTasks);
router.get('/inbox', getInboxTasks);
router.get('/completed', getCompletedTasks);
router.post('/', createTask);
router.post('/batch-reschedule', batchRescheduleTasks);
router.post('/batch-cleanup', batchCleanupTasks);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskCompletion);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;
