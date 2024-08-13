import express from 'express';
import EventController from '../controllers/EventControllers';
import AuthUser from '../middleware/authToken';

const router = express.Router();

// Get events by creator
router.get('/myevents', AuthUser, EventController.getEventsByCreator);
// Get events by user
router.get('/registered', AuthUser, EventController.getRegisteredEvents);

// GET all, GET by id, POST, PUT, DELETE events
router.get('/', AuthUser, EventController.getAllEvents);
router.get('/:id', AuthUser, EventController.getEventById);
router.post('/', AuthUser, EventController.createEvent);
router.put('/:id', AuthUser, EventController.updateEvent);
router.delete('/:id', AuthUser, EventController.deleteEvent);

// Register and Unregister for an event
router.post('/:id/register', AuthUser, EventController.registerEvent);
router.delete('/:id/unregister', AuthUser, EventController.unregisterEvent);

// Get event attendees
router.get('/:id/attendees', AuthUser, EventController.getEventAttendees);

export default router;
