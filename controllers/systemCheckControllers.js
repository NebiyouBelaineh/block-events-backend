// src/controllers/systemCheckController.js
import mongoose from 'mongoose';
import User from '../models/user';
import Event from '../models/events';

// Check the status of the database connection
export const checkDbStatus = (req, res) => {
  const connectionState = mongoose.connection.readyState;
  const status = {
    Disconnected: 0,
    Connected: 1,
    Connecting: 2,
    Disconnecting: 3,
  };

  res.json({
    dbStatus: Object.keys(status).find((key) => status[key] === connectionState),
  });
};

// Get counts of events and users
export const getCounts = async (req, res) => {
  try {
    const eventCount = await Event.countDocuments();
    const userCount = await User.countDocuments();
    res.json({
      eventCount,
      userCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving counts', error });
  }
};
