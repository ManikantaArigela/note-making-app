import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_productivity_jwt_key_2026', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@focusflow.com').toLowerCase();
    const role = cleanEmail === adminEmail ? 'admin' : 'user';

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role,
    });

    // Create a welcoming notification for the new user
    try {
      await Notification.create({
        userId: user._id,
        title: `Welcome to FocusFlow, ${cleanName.split(' ')[0]}! 🚀`,
        message: 'Your productivity workspace is ready. Start by adding your first task or exploring your dashboard!',
        type: 'system',
      });
    } catch (notifErr) {
      console.warn('Could not create welcome notification:', notifErr.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || '',
      bio: user.bio || 'Productivity seeker 🚀',
      level: user.level || 1,
      xp: user.xp || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      preferences: user.preferences,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]?.message || 'Validation error';
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@focusflow.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Failsafe auto-grant / sync for admin user credentials
    if (cleanEmail === adminEmail && password === adminPassword) {
      let adminUser = await User.findOne({ email: adminEmail }).select('+password');
      if (!adminUser) {
        adminUser = await User.create({
          name: 'System Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          bio: 'FocusFlow Administrator 🛡️',
        });
      } else {
        let dirty = false;
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
          dirty = true;
        }
        const matches = await adminUser.matchPassword(password);
        if (!matches) {
          adminUser.password = password;
          dirty = true;
        }
        if (dirty) {
          await adminUser.save();
        }
      }

      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        avatar: adminUser.avatar || '',
        bio: adminUser.bio || 'FocusFlow Administrator 🛡️',
        level: adminUser.level || 1,
        xp: adminUser.xp || 0,
        currentStreak: adminUser.currentStreak || 0,
        longestStreak: adminUser.longestStreak || 0,
        preferences: adminUser.preferences,
        token: generateToken(adminUser._id),
      });
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Auto promote if user email is admin email
    if (cleanEmail === adminEmail && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || '',
      bio: user.bio || 'Productivity seeker 🚀',
      level: user.level || 1,
      xp: user.xp || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      preferences: user.preferences,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const ensureAdminUserExists = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@focusflow.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let adminUser = await User.findOne({ email: adminEmail }).select('+password');

    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        bio: 'FocusFlow Administrator 🛡️',
      });
      console.log(`[Admin Seed]: Default admin user created successfully (${adminEmail})`);
    } else {
      let dirty = false;
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        dirty = true;
      }
      const matches = await adminUser.matchPassword(adminPassword);
      if (!matches) {
        adminUser.password = adminPassword;
        dirty = true;
      }
      if (dirty) {
        await adminUser.save();
        console.log(`[Admin Seed]: Admin credentials updated for ${adminEmail}`);
      }
    }
  } catch (err) {
    console.warn('[Admin Seed Warning]:', err.message);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.preferences = {
      ...user.preferences,
      ...req.body,
    };

    const updatedUser = await user.save();
    res.json(updatedUser.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
