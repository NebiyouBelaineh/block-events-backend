// src/routes/systemCheckRoutes.js
import express from 'express';
import { checkDbStatus, getCounts } from '../controllers/systemCheckControllers';

const router = express.Router();

// Endpoint to check database connectivity
router.get('/status', checkDbStatus);

// Endpoint to get counts of events and users
router.get('/counts', getCounts);

export default router;
