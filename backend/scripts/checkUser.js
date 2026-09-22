import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

console.log('Connecting to URI:', uri ? uri.substring(0, 30) + '...' : 'NONE');

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB!');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const user = await User.findOne({ email: 'arigelamanikanta2005@gmail.com' });
    
    if (user) {
      console.log('FOUND USER:', user._id.toString(), user.name, user.email);
    } else {
      console.log('USER NOT FOUND for arigelamanikanta2005@gmail.com');
      const allUsers = await User.find({}, 'name email');
      console.log('All Users in DB:', allUsers);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
