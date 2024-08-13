import Event from '../models/events';
import User from '../models/user';
import { validateLocation, validateId } from '../services/Validators';
import notificationController from './notificationController';

class EventController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createEvent(req, res) {
    const {
      title, description, startDateTime, endDateTime,
      location, attendees, tags, media,
      isRecurring, recurrenceRule, catagory, status,
    } = req.body;

    if (!title) { return res.status(400).json({ error: 'Title is required' }); }
    if (!description) { return res.status(400).json({ error: 'Description is required' }); }
    if (!startDateTime) { return res.status(400).json({ error: 'StartDateTime is required' }); }
    // if (!createdBy) { return res.status(400).json({ error: 'CreatedBy is required' }); }
    if (!location || !validateLocation(location)) { return res.status(400).json({ error: 'Location is missing or not complete.' }); }
    if (!tags) { return res.status(400).json({ error: 'Tags is required' }); }

    try {
      const createdBy = req.user._id;
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
      // Call setEventReminder() to set notification for 1 week and 1 day prior to event
      notificationController.setEventReminder(event.toObject());
      return res.status(201).json({ message: 'Event created successfully', newEvent });
    } catch (error) {
      // console.error('Error occurred while creating event:', error);
      return res.status(500).json({ message: 'Error occured while creating event', error });
    }
  }

  static async getEventById(req, res) {
    const { id } = req.params;
    // console.log('Inside getEventById', id);
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    const event = await Event.findOne({ _id: id })
      .catch((error) => (res.status(500).json({ error: `Error occured while finding event: ${error.message} ` })));
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.json(event);
  }

  static async getAllEvents(req, res) {
    const events = await Event.find()
      .catch((error) => (res.status(500).json({ error: `Error occured while finding event: ${error.message} ` })));
    if (!events) {
      return res.status(404).json({ error: 'Events not found' });
    }
    return res.json({ events });
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
      // Send email notification of event update
      notificationController.eventUpdate(updatedEvent.toObject());
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
      // Send email notification of that event is canceled and
      // then delete the notification for that event
      await notificationController.eventCancellation(event.toObject());
      await notificationController.deleteEventReminder(id);
      await Event.findByIdAndDelete(id);
      return res.json({ message: 'Event successfully deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while deleting event', error });
    }
  }

  /**
   * Accessed through /api/events/registered
   */
  static async getRegisteredEvents(req, res) {
    const userId = req.user._id;

    // if (!userId || validateId(userId) === false) {
    //   return res.status(400).json({ error: 'Please provide appropriate userId' });
    // }
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const notAllowed = ['createdBy', 'attendees', '_id'];
      const userRegisteredEvents = await Event.find({ _id: { $in: user.registeredEvents } });
      const filteredRegisteredEvents = userRegisteredEvents.map((event) => Object.fromEntries(
        Object.entries(event.toObject()).filter(([key]) => !notAllowed.includes(key)),
      ));
      return res.json({ userRegisteredEvents: filteredRegisteredEvents });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting events', error });
    }
  }

  /** Gets all the events created by a user
   * Accessed through /api/events/myevents
  */
  static async getEventsByCreator(req, res) {
    const userId = req.body;

    if (!userId || validateId(userId) === false) {
      return res.status(400).json({ error: 'Please provide appropriate userId' });
    }
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const notAllowed = ['_id'];
      const myEvents = await Event.find({ _id: { $in: user.createdEvents } });
      const filteredRegisteredEvents = myEvents.map((event) => Object.fromEntries(
        Object.entries(event.toObject()).filter(([key]) => !notAllowed.includes(key)),
      ));
      return res.json({ myEvents: filteredRegisteredEvents });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting events', error });
    }
  }

  /** Gets all the attendees of an event
   * Accessed through /api/events/:id/attendees
  */
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

      if (attendees && attendees.length > 0) {
        // Filter out unnecessary fields
        const allowedFields = ['profile', 'userName', 'email'];
        const filterdAttendees = attendees.map((attendee) => {
          const filteredAttendee = {};
          allowedFields.forEach((field) => {
            if (attendee[field]) {
              filteredAttendee[field] = attendee[field];
            }
          });
          return filteredAttendee;
        });
        return res.json(filterdAttendees);
      }
      return res.status(404).json({ error: 'Attendees not found' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting attendees', error });
    }
  }

  /** Register for an event
   * Accessed through /api/events/:id/register
   */
  static async registerEvent(req, res) {
    const { id } = req.params;
    const { user } = req;

    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Event Id' });
    }
    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (user.registeredEvents.includes(event._id)) {
        return res.status(400).json({ error: 'User has already registered for this event' });
      }
      await User.updateOne(
        { _id: user._id },
        {
          $push: { registeredEvents: event._id },
        },
      );
      await Event.updateOne(
        { _id: id },
        {
          $push: { attendees: user._id },
        },
      );
      // Send email notification
      const mail = notificationController.eventRegistration(event.toObject(), user.toObject());
      if (mail) {
        return res.json({ message: 'Event registered successfully' });
      }
      return res.status(500).json({ error: 'Error occurred while registering for event, check logs' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while registering for event', error });
    }
  }

  /** Unregister for an event
   * Accessed through /api/events/:id/unregister
   */
  static async unregisterEvent(req, res) {
    const { id } = req.params;
    const { user } = req;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (!user.registeredEvents.includes(event._id)) {
        return res.status(400).json({ error: 'User has not registered for this event' });
      }
      await User.updateOne(
        { _id: user._id },
        {
          $pull: { registeredEvents: event._id },
        },
      );
      await Event.updateOne(
        { _id: id },
        {
          $pull: { attendees: user._id },
        },
      );
      return res.json({ message: 'Unregistered event successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while unregistering for event', error });
    }
  }

  static async sendInvitation(req, res) {
    const { eventId, emails } = req.body; // Email should be validated
    const { user } = req;
    // console.log(userId, req.user);
    if (!eventId || validateId(eventId) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: 'Please provide appropriate email(s)' });
    }

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const invitationStatus = notificationController.eventInvite(
        event.toObject(),
        user.toObject(),
        emails,
      );
      if (invitationStatus) {
        return res.json({ message: 'Invitation sent.' });
      }
      return res.status(500).json({ message: 'Error occurred while sending feedback, check logs' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while sending invitation', error });
    }
  }

  static async sendFeedBack(req, res) {
    const { id } = req.params;
    const { feedback } = req.body; // Email should be validated
    const { user } = req;

    if (!id || validateId(id) === false) {
      return res.status(400).json({ error: 'Please provide appropriate Id' });
    }
    if (!feedback || feedback.length === 0) {
      return res.status(400).json({ error: 'Feedback is empty or not provided' });
    }

    try {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const feedbackStatus = notificationController.eventFeedback(event.toObject(), user, feedback);
      if (feedbackStatus) {
        return res.json({ message: 'Feedback sent successfully' });
      }
      return res.status(500).json({ message: 'Error occurred while sending feedback, check logs' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while sending feedback', error });
    }
  }
}

export default EventController;
