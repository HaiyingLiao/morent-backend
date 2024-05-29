import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable not set.');
}

const connectToDatabase = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
export default connectToDatabase;
