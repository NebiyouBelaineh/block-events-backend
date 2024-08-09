import mongoose from 'mongoose';

const { configDotenv } = require('dotenv');

configDotenv();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;

const dbUri = `mongodb+srv://${username}:${password}${cluster}`;

const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

// Function to disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
  }
};

export { connectDB, disconnectDB };
