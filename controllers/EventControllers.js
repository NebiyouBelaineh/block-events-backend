import Event from '../models/events';
import User from '../models/user';

class EventController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createEvent(req, res) {
    const {
      title, description, date, location, createdBy, attendees, tags,
    } = req.body;
    const dateDefault = Date.now();
    if (!title) { res.status(400).json({ error: 'Title is required' }); }
    if (!description) { res.status(400).json({ error: 'Description is required' }); }
    if (!location) { res.status(400).json({ error: 'Location is required' }); }
    if (!createdBy) { res.status(400).json({ error: 'CreatedBy is required' }); }

    try {
      const newEvent = new Event({
        title,
        description,
        date: date || dateDefault,
        location,
        createdBy,
        attendees,
        tags,
      });

      const event = await newEvent.save();
      console.log(event);

      await User.findByIdAndUpdate(
        createdBy,
        { $push: { createdEvents: event._id } },
        { new: true }, // Return the updated user
      );
      res.json({ message: 'Event created successfully', newEvent });
    } catch (error) {
      // console.error('Error occurred while creating event:', error);
      res.json({ message: 'Error occured while creating event', error });
    }
  }

  static async getEventById(req, res) {
    const { id } = req.params;
    if (!id) { res.status(400).json({ error: 'ID is required' }); }

    const event = await Event.findOne({ _id: id }).catch((error) => {
      res.json({ error: `Error occured while finding event: ${error.message} ` });
    });
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.json(event);
    }
  }

  static async getAllEvents(req, res) {
    const events = await Event.find().catch((error) => {
      res.json({ error: `Error occured while finding event: ${error.message} ` });
    });
    if (!events) {
      res.status(404).json({ error: 'Events not found' });
    } else {
      res.json({ events });
    }
  }

  static async updateEvent(req, res) {
    const { id } = req.params;
    const { name, date } = req.query;
    res.send(`Event with id: ${id} updated: date:${date} name: ${name} `);
  }

  static async deleteEvent(req, res) {
    const { id } = req.params;
    res.send(`Event with id: ${id} deleted`);
  }
}

export default EventController;
