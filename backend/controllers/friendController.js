import { User } from '../models/User.js';
import { Friendship } from '../models/Friendship.js';
import { Notification } from '../models/Notification.js';

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }],
    })
      .select('name email avatar bio level currentStreak')
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendships = await Friendship.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
    })
      .populate('requesterId', 'name email avatar bio level xp currentStreak')
      .populate('recipientId', 'name email avatar bio level xp currentStreak');

    const acceptedFriends = [];
    const pendingRequests = [];

    friendships.forEach((f) => {
      const isRequester = f.requesterId._id.toString() === userId.toString();
      const otherUser = isRequester ? f.recipientId : f.requesterId;

      if (f.status === 'accepted') {
        acceptedFriends.push({
          friendshipId: f._id,
          user: otherUser,
        });
      } else if (f.status === 'pending') {
        pendingRequests.push({
          friendshipId: f._id,
          user: otherUser,
          isIncoming: !isRequester,
        });
      }
    });

    res.json({ acceptedFriends, pendingRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    if (recipientId === requesterId.toString()) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: 'Friendship request already exists or you are already friends' });
    }

    const friendship = await Friendship.create({
      requesterId,
      recipientId,
      status: 'pending',
    });

    // Send notification to recipient
    await Notification.create({
      userId: recipientId,
      title: '👥 New Friend Request',
      message: `${req.user.name} sent you a friend request.`,
      type: 'friend_request',
    });

    res.status(201).json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // friendship ID
    const { action } = req.body; // 'accept' or 'reject'

    const friendship = await Friendship.findById(id);
    if (!friendship || friendship.recipientId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();

      await Notification.create({
        userId: friendship.requesterId,
        title: '🎉 Friend Request Accepted',
        message: `${req.user.name} accepted your friend request!`,
        type: 'friend_request',
      });

      return res.json({ message: 'Friend request accepted', friendship });
    } else {
      friendship.status = 'rejected';
      await friendship.save();
      return res.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
