import express from 'express';
import EventController from '../controllers/EventControllers';
import AuthUser from '../middleware/authToken';

const router = express.Router();

// GET all, GET by id, POST, PUT, DELETE events
router.get('/', AuthUser, EventController.getAllEvents);
router.get('/:id', AuthUser, EventController.getEventById);
router.post('/', AuthUser, EventController.createEvent);
router.put('/:id', AuthUser, EventController.updateEvent);
router.delete('/:id', AuthUser, EventController.deleteEvent);

// Register and Unregister for an event
router.put('/:id/register', AuthUser, EventController.registerEvent);
router.put('/:id/unregister', AuthUser, EventController.unregisterEvent);

// Get events by creator
router.get('/creator/:id', AuthUser, EventController.getEventsByCreator);
// Get events by user
router.get('/user/:id/userevents', AuthUser, EventController.getRegisteredEvents);
// Get event attendees
router.get('/event/:id/attendees', AuthUser, EventController.getEventAttendees);

export default router;
