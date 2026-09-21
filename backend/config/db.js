import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app';
    if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
      console.warn('[MongoDB Warning]: MONGODB_URI environment variable is not set in production!');
    }
    const conn = await mongoose.connect(uri.trim());
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

