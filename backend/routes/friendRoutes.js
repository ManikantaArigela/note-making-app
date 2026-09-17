import express from 'express';
import {
  searchUsers,
  getFriends,
  sendFriendRequest,
  respondFriendRequest,
} from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/search', searchUsers);
router.get('/', getFriends);
router.post('/request', sendFriendRequest);
router.patch('/request/:id', respondFriendRequest);

export default router;
