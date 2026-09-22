import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app';

async function resetPassword() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const emails = ['arigelamanikanta2005@gmail.com', 'arigelamanikanta2k05@gmail.com'];

    for (const email of emails) {
      const user = await User.findOne({ email }).select('+password');
      if (user) {
        user.password = 'password123';
        await user.save();
        console.log(`Successfully reset password for ${email} to "password123"`);
        
        // Verify match
        const matches = await user.matchPassword('password123');
        console.log(`Verification match for ${email}: ${matches}`);
      } else {
        console.log(`User ${email} not found`);
      }
    }
  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
