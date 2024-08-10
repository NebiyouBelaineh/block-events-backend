import Event from '../models/events';
import User from '../models/user';
import { validateLocation, validateId } from '../services/Validators';

class EventController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createEvent(req, res) {
    const {
      title, description, startDateTime, endDateTime,
      location, createdBy, attendees, tags, media,
      isRecurring, recurrenceRule, catagory, status,
    } = req.body;

    if (!title) { res.status(400).json({ error: 'Title is required' }); }
    if (!description) { res.status(400).json({ error: 'Description is required' }); }
    if (!startDateTime) { res.status(400).json({ error: 'StartDateTime is required' }); }
    if (!createdBy) { res.status(400).json({ error: 'CreatedBy is required' }); }
    if (!location && validateLocation(location)) { res.status(400).json({ error: 'Location is missing or not complete.' }); }
    if (!tags) { res.status(400).json({ error: 'Tags is required' }); }

    try {
      const newEvent = new Event({
        title,
        description,
        location,
        startDateTime,
        endDateTime,
        createdBy,
        attendees,
        tags,
        media,
        catagory,
        status,
        recurrenceRule,
        isRecurring,
      });

      const event = await newEvent.save();
      // Update createdBy in User model
      await User.findByIdAndUpdate(
        createdBy,
        { $push: { createdEvents: event._id } },
        { new: true }, // Return the updated user
      );
      res.status(201).json({ message: 'Event created successfully', newEvent });
    } catch (error) {
      // console.error('Error occurred while creating event:', error);
      res.status(500).json({ message: 'Error occured while creating event', error });
    }
  }

  static async getEventById(req, res) {
    const { id } = req.params;

    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    const event = await Event.findOne({ _id: id })
      .catch((error) => (res.status(500).json({ error: `Error occured while finding event: ${error.message} ` })));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.json(event);
  }

  static async getAllEvents(req, res) {
    const events = await Event.find().catch((error) => {
      res.status(500).json({ error: `Error occured while finding event: ${error.message} ` });
    });
    if (!events) {
      res.status(404).json({ error: 'Events not found' });
    } else {
      res.json({ events });
    }
  }

  static async updateEvent(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    try {
      /* createdBy and attendees would need their own endpoints
       to be updated for security and convenience
       */
      const notAllowed = ['createdBy', 'attendees', '_id'];
      const reqBody = req.body;
      const entries = Object.entries(reqBody);
      const filteredEntries = entries.filter(([key]) => !notAllowed.includes(key));
      const filteredObj = Object.fromEntries(filteredEntries);
      const updatedEvent = await Event.findByIdAndUpdate(
        id,
        filteredObj,
        { new: true },
      );
      return res.json({ message: 'Event updated.', updatedEvent });
    } catch (error) {
      return res.status(500).json({ message: 'Error occured while updating event', error });
    }
  }

  static async deleteEvent(req, res) {
    const { id } = req.params;
    res.send(`Event with id: ${id} deleted`);
  }
}

export default EventController;
