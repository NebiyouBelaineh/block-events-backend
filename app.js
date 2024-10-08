import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import notificationController from './controllers/notificationController';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import authRoutes from './routes/authRoutes';
import { checkDbStatus, getCounts } from './controllers/systemCheckControllers';
import { connectDB, disconnectDB } from './config/db';
import AppError from './util/appError';
import serviceRoutes from './routes/serviceRoutes';

// Load environment variables
dotenv.config();

const app = express();

const { sendDueNotifications } = notificationController;
// eslint-disable-next-line import/no-extraneous-dependencies
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  await sendDueNotifications();
});

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));

// middleware to serve satic files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// ensure the media folder exits
const mediaDir = path.join(publicDir, 'media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

app.use(express.json());

// Bad JSON handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON, please check format!' });
  }
  return next();
});

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/status', checkDbStatus);
app.use('/api/counts', getCounts);
app.use('/api/auth', authRoutes);
app.use('/api/service', serviceRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

// middlewhare handler
// app.use(globalErrorHandler);
// Define the port
const port = process.env.PORT || 3300;

// Connect to MongoDB and then start the Express server
const startServer = async () => {
  await connectDB();

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  // Start server
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
};

// Start the server
startServer();

// Gracefully shut down the server and disconnect from the database
process.on('SIGINT', async () => {
  console.log('SIGINT signal received.');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received.');
  await disconnectDB();
  process.exit(0);
});
