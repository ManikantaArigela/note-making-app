import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app';

const targetHash = '$2a$10$41RgP5UsYVEy9MdhoCjMYuQr721jc.OGPeK6YDt5zoaTLS6vVFpTO';

async function restoreHash() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const emails = ['arigelamanikanta2005@gmail.com', 'arigelamanikanta2k05@gmail.com'];

    for (const email of emails) {
      const result = await User.updateOne(
        { email },
        { $set: { password: targetHash } }
      );
      console.log(`Updated ${email}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }

    console.log('Successfully restored exact bcrypt hash in MongoDB!');
  } catch (err) {
    console.error('Error updating hash:', err);
  } finally {
    await mongoose.disconnect();
  }
}

restoreHash();
