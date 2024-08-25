import mongoose from 'mongoose';

const { configDotenv } = require('dotenv');

configDotenv();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;

// eslint-disable-next-line no-unused-vars
const localDBUrl = process.env.DB_CLUSTER_LOCAL_URL;

// eslint-disable-next-line no-unused-vars
const dbUri = `mongodb+srv://${username}:${password}${cluster}`;
// eslint-disable-next-line no-unused-vars
const dbConnectionString = process.env.DB_CONNECTION_STRING;
// console.log(dbConnectionString);

const connectDB = async () => {
  try {
    /* Connect to MongoDB atlas */
    await mongoose.connect(dbConnectionString);
    // await mongoose.connect(dbUri);

    /* Connect to local MongoDB */
    // await mongoose.connect(localDBUrl);

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
