import express from 'express';
import EventController from '../controllers/EventControllers';
import AuthController from '../controllers/authController';

const router = express.Router();

// Get events by creator
router.get('/myevents', AuthController.protect, EventController.getEventsByCreator);
// Get events by user
router.get('/registered', AuthController.protect, EventController.getRegisteredEvents);
// Send invitation
router.post('/invite', AuthController.protect, EventController.sendInvitation);
// Send feedback
router.post('/:id/feedback', AuthController.protect, EventController.sendFeedBack);

// GET all, GET by id, POST, PUT, DELETE events
router.get('/', AuthController.protect, EventController.getAllEvents);
router.get('/:id', AuthController.protect, EventController.getEventById);
router.post('/', AuthController.protect, EventController.createEvent);
router.put('/:id', AuthController.protect, EventController.updateEvent);
router.delete('/:id', AuthController.protect, EventController.deleteEvent);

// Register and Unregister for an event
router.post('/:id/register', AuthController.protect, EventController.registerEvent);
router.delete('/:id/unregister', AuthController.protect, EventController.unregisterEvent);

// Get event attendees
router.get('/:id/attendees', AuthController.protect, EventController.getEventAttendees);

export default router;
