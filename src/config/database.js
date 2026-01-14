import mongoose from 'mongoose';
import env from './environment.js';

const connectDB = async () => {
  try {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured in environment variables');
    }
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
