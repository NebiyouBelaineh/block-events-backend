import express from 'express';
import notificationController from '../controllers/notificationController';
import AuthController from '../controllers/authController';

const router = express.Router();

// Get events by creator
router.post('/', AuthController.protect, notificationController.serviceRequest);

export default router;