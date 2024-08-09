import express from 'express';
import EventController from '../controllers/EventControllers';

const router = express.Router();

// Get all events
router.get('/', EventController.getEvent);

router.get('/:id', EventController.getEvent);

router.post('/', EventController.createEvent);

router.put('/:id', EventController.updateEvent);

router.delete('/:id', EventController.deleteEvent);

export default router;
