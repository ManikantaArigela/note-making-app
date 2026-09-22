import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uris = [
  process.env.MONGODB_URI,
  'mongodb://127.0.0.1:27017/productivity_app',
  'mongodb://localhost:27017/productivity_app'
].filter(Boolean);

async function testAll() {
  for (const uri of uris) {
    console.log('\nTesting URI:', uri);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ SUCCESS CONNECTED TO:', uri);
      
      const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
      const users = await User.find({});
      console.log(`Found ${users.length} users:`);
      users.forEach(u => console.log(` - ID: ${u._id} | Email: ${u.email} | Name: ${u.name}`));
      
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.error('❌ FAILED:', err.message);
      try { await mongoose.disconnect(); } catch(e){}
    }
  }
}

testAll();
