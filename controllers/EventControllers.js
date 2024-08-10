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
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      // Remove the event to be deleted from attendees in all users
      await User.updateMany(
        { _id: { $in: event.attendees } },
        {
          $pull: { registeredEvents: event._id },
        },
      );
      await Event.findByIdAndDelete(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      return res.json({ message: 'Event successfully deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while deleting event', error });
    }
  }

  /* Gets all the events registered by a user */
  static async getRegisteredEvents(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userRegisteredEvents = await Event.find({ _id: { $in: user.registeredEvents } });
      return res.json({ userRegisteredEvents });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting events', error });
    }
  }

  /* Gets all the events created by a user */
  static async getEventsByCreator(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const myEvents = await Event.find({ _id: { $in: user.createdEvents } });
      return res.json({ myEvents });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting events', error });
    }
  }

  /* Gets all the attendees of an event */
  static async getEventAttendees(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const attendees = await User.find({ _id: { $in: event.attendees } });
      return res.json({ attendees });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting attendees', error });
    }
  }

  /* Register for an event */
  static async registerEvent(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.registeredEvents.includes(event._id)) {
        return res.status(400).json({ error: 'User has already registered for this event' });
      }
      await User.updateOne(
        { _id: req.user._id },
        {
          $push: { registeredEvents: event._id },
        },
      );
      return res.json({ message: 'Event registered successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while registering for event', error });
    }
  }

  /* Unregister for an event */
  static async unregisterEvent(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (!user.registeredEvents.includes(event._id)) {
        return res.status(400).json({ error: 'User has not registered for this event' });
      }
      await User.updateOne(
        { _id: req.user._id },
        {
          $pull: { registeredEvents: event._id },
        },
      );
      return res.json({ message: 'Event unregistered successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while unregistering for event', error });
    }
  }
}

export default EventController;
