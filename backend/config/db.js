import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://arigelamanikanta2006_db_user:pushpa@cluster0.bwfmbxs.mongodb.net/productivity?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(uri.trim());
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

