import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app';

async function verify() {
  try {
    await mongoose.connect(uri);
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
    const ActivityEvent = mongoose.model('ActivityEvent', new mongoose.Schema({}, { strict: false }));

    const user = await User.findOne({ email: 'arigelamanikanta2005@gmail.com' });
    console.log('User found:', user.name, user.email, 'Streak:', user.currentStreak);

    const taskCount = await Task.countDocuments({ userId: user._id });
    const activityCount = await ActivityEvent.countDocuments({ userId: user._id });

    console.log(`Verified MongoDB records for ${user.email}:`);
    console.log(` - Total Completed Tasks: ${taskCount}`);
    console.log(` - Total Activity Log Events: ${activityCount}`);

    const groupedByDate = await Task.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$completedDateStr', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    console.log('\nDaily Task Counts:');
    groupedByDate.forEach(g => console.log(` - ${g._id}: ${g.count} tasks`));

  } catch (err) {
    console.error('Error verifying:', err);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
