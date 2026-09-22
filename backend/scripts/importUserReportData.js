import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app';

const rawReport = [
  {
    dateStr: '2026-09-17',
    items: [
      { time: '16:45', title: 'Individual project work' },
      { time: '16:45', title: 'Individual project work' },
      { time: '16:38', title: 'Individual project work' },
      { time: '16:37', title: 'Projects on above learning' },
      { time: '16:37', title: 'ML' },
      { time: '16:37', title: 'LeetCode problem' },
      { time: '16:37', title: 'Data engineer learning' },
      { time: '16:37', title: 'MERN' },
      { time: '16:36', title: 'C4GT project' },
      { time: '16:36', title: 'GeeksforGeeks problem' },
      { time: '16:36', title: 'CodeChef problem' },
      { time: '16:36', title: 'HackerRank problem' },
    ],
  },
  {
    dateStr: '2026-09-16',
    items: [
      { time: '16:46', title: 'GeeksforGeeks problem' },
      { time: '16:46', title: 'LeetCode problem' },
      { time: '16:46', title: 'MERN' },
      { time: '16:46', title: 'Individual project work' },
      { time: '16:46', title: 'C4GT project' },
      { time: '16:18', title: 'HackerRank problem' },
      { time: '16:17', title: 'LeetCode problem' },
      { time: '16:17', title: 'CodeChef problem' },
      { time: '10:37', title: 'Data engineer learning' },
      { time: '10:37', title: 'ML' },
    ],
  },
  {
    dateStr: '2026-09-15',
    items: [
      { time: '21:01', title: 'MERN' },
      { time: '21:01', title: 'LeetCode problem' },
      { time: '21:01', title: 'CodeChef problem' },
      { time: '13:39', title: 'Individual project work' },
      { time: '13:39', title: 'C4GT project' },
    ],
  },
  {
    dateStr: '2026-09-14',
    items: [
      { time: '22:23', title: 'Practical knowledge on data engineering' },
      { time: '22:23', title: 'Data engineer learning' },
      { time: '22:23', title: 'LeetCode problem' },
      { time: '22:23', title: 'HackerRank problem' },
      { time: '22:23', title: 'CodeChef problem' },
      { time: '22:23', title: 'Individual project work' },
      { time: '22:23', title: 'C4GT project' },
      { time: '22:23', title: 'GeeksforGeeks problem' },
    ],
  },
  {
    dateStr: '2026-09-13',
    items: [
      { time: '20:50', title: 'CodeChef problem' },
      { time: '20:50', title: 'GeeksforGeeks problem' },
      { time: '20:50', title: 'C4GT project' },
      { time: '20:50', title: 'Individual project work' },
      { time: '20:50', title: 'LeetCode problem' },
    ],
  },
  {
    dateStr: '2026-09-12',
    items: [
      { time: '23:10', title: 'GeeksforGeeks problem' },
      { time: '16:18', title: 'LeetCode problem' },
      { time: '16:17', title: 'LeetCode problem' },
      { time: '16:17', title: 'LeetCode problem' },
      { time: '16:17', title: 'LeetCode problem' },
      { time: '16:16', title: 'Individual project work' },
      { time: '16:16', title: 'HackerRank problem' },
      { time: '16:14', title: 'LeetCode problem' },
      { time: '16:13', title: 'C4GT project' },
      { time: '16:13', title: 'Projects on above learning' },
      { time: '16:13', title: 'Figma one sector pages' },
    ],
  },
  {
    dateStr: '2026-09-11',
    items: [
      { time: '11:33', title: 'LeetCode problem' },
      { time: '11:32', title: 'HackerRank problem' },
    ],
  },
];

function determineCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('leetcode') || t.includes('geeksforgeeks') || t.includes('codechef') || t.includes('hackerrank')) {
    return 'DSA';
  }
  if (t.includes('data engineer') || t.includes('ml') || t.includes('mern') || t.includes('practical knowledge')) {
    return 'Learning';
  }
  if (t.includes('project') || t.includes('figma')) {
    return 'Project';
  }
  return 'General';
}

async function runImport() {
  try {
    console.log('Connecting to MongoDB:', uri);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully!');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
    const ActivityEvent = mongoose.model('ActivityEvent', new mongoose.Schema({}, { strict: false }));

    const targetEmails = ['arigelamanikanta2005@gmail.com', 'arigelamanikanta2k05@gmail.com'];

    for (const email of targetEmails) {
      let user = await User.findOne({ email });

      if (!user && email === 'arigelamanikanta2005@gmail.com') {
        // Create user if doesn't exist yet
        user = await User.create({
          name: 'Manikanta Arigela',
          email,
          password: '$2a$10$wZgKz7.20/3XhFqf9zP/ye8kS5.4zF1e.6Wz2x4o7G6w8k', // password123
          level: 5,
          xp: 520,
          currentStreak: 7,
          longestStreak: 7,
          lastActiveDate: '2026-09-17',
        });
        console.log(`Created new account for ${email}`);
      }

      if (!user) {
        console.log(`User ${email} not found, skipping...`);
        continue;
      }

      console.log(`\nImporting reporting data for user: ${user.name} (${user.email}, ID: ${user._id})`);

      let totalTasksImported = 0;
      let totalActivitiesImported = 0;

      for (const dayGroup of rawReport) {
        const { dateStr, items } = dayGroup;

        for (const item of items) {
          const completedAtDate = new Date(`${dateStr}T${item.time}:00.000Z`);
          const category = determineCategory(item.title);

          // Create Task
          const task = await Task.create({
            userId: user._id,
            title: item.title,
            description: 'Imported from activity report',
            category,
            priority: 'medium',
            state: 'completed',
            scheduledDate: dateStr,
            dueTime: item.time,
            isCompleted: true,
            completedAt: completedAtDate,
            completedDateStr: dateStr,
            createdAt: completedAtDate,
            updatedAt: completedAtDate,
          });

          // Create Activity Event
          await ActivityEvent.create({
            userId: user._id,
            eventType: 'TASK_COMPLETED',
            referenceId: task._id,
            referenceType: 'Task',
            title: `Completed task: "${item.title}"`,
            impactScore: category === 'DSA' ? 2 : 1,
            dateStr: dateStr,
            createdAt: completedAtDate,
            metadata: {
              category,
              priority: 'medium',
            },
          });

          totalTasksImported++;
          totalActivitiesImported++;
        }
      }

      // Update user streak and xp
      await User.findByIdAndUpdate(user._id, {
        $set: {
          currentStreak: 7,
          longestStreak: Math.max(user.longestStreak || 0, 7),
          lastActiveDate: '2026-09-17',
        },
        $inc: {
          xp: totalTasksImported * 15,
          level: 1,
        },
      });

      console.log(`Successfully imported ${totalTasksImported} tasks & ${totalActivitiesImported} activity logs for ${email}!`);
    }

    console.log('\nData import process completed cleanly!');
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runImport();
