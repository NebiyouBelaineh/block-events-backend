// eslint-disable-next-line import/no-extraneous-dependencies
import path from 'path';
import fs from 'fs';
import validator from 'validator';
import Event from '../models/events';
import User from '../models/user';
import { validateId } from '../services/Validators';
import notificationController from './notificationController';

class EventController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createEvent(req, res) {
    const {
      title, description, location,
      organizerAddress, organizerName,
      organizerEmail, startDateTime,
      endDateTime, category, status, tags,
    } = req.body;
    const mediaDir = path.join(__dirname, '../public/media');
    const media = req.file ? req.file.filename : null; // Get the filenames of uploaded files
    const errors = [];

    // Validate fields
    if (!title || !validator.isLength(title.trim(), { min: 1 })) {
      errors.push({ field: 'title', message: 'Title is required' });
    }
    if (!location || !validator.isLength(location.trim(), { min: 1 })) {
      errors.push({ field: 'location', message: 'Location is required' });
    }
    if (!description || !validator.isLength(description.trim(), { min: 1 })) {
      errors.push({ field: 'description', message: 'Description is required' });
    }
    if (!validator.isLength(organizerAddress.trim(), { min: 1 })) {
      errors.push({ field: 'organizerAddress', message: 'Valid organizer address is required' });
    }
    if (!validator.isLength(organizerName.trim(), { min: 1 })) {
      errors.push({ field: 'organizerName', message: 'Valid organizer name is required' });
    }
    if (!validator.isLength(organizerEmail.trim(), { min: 1 })) {
      errors.push({ field: 'organizerEmail', message: 'Valid organizer email is required' });
    }
    if (!validator.isEmail(organizerEmail) && !validator.isEmpty(organizerEmail.trim())) {
      errors.push({ field: 'organizerEmail', message: 'Valid organizer email is required' });
    }
    if (!startDateTime) {
      errors.push({ field: 'startDate', message: 'Start date-time is required' });
    }
    if (!endDateTime) {
      errors.push({ field: 'endDate', message: 'End date-time are required' });
    }
    if (startDateTime >= endDateTime && startDateTime && endDateTime) {
      errors.push({ field: 'startDate', message: 'End date-time must be after Start date-time' });
      errors.push({ field: 'endDate', message: 'End date-time must be after Start date-time' });
    }
    if (!category || !validator.isLength(category.trim(), { min: 1 })) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    if (!status || !validator.isLength(status.trim(), { min: 1 })) {
      errors.push({ field: 'status', message: 'Status is required' });
    }

    // Handle tags
    let tagsArray = [];
    if (tags) {
      tagsArray = tags.split(/[\s,]+/).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    } else if (!tags || !validator.isLength(tags.trim(), { min: 1 })) {
      errors.push({ field: 'tags', message: 'Tags is required' });
    }

    // Check if the user exists
    const createdBy = req.user._id;
    // const { createdBy } = req.body;
    const user = await User.findById(createdBy);
    if (!user) {
      errors.push({ field: 'user', message: 'User not found' });
    }

    if (errors.length > 0) {
      // Clean up uploaded files in case of validation errors
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(400).json({ errors });
    }

    try {
      const newEvent = await Event.create({
        title,
        description,
        location,
        organizer: {
          address: organizerAddress,
          name: organizerName,
          email: organizerEmail,
        },
        startDateTime,
        endDateTime,
        createdBy,
        tags: tagsArray, // Use the processed tags array
        media, // Store filenames of uploaded files
        category,
        status: status || 'active',
      });

      return res.status(201).json({
        status: 'success',
        data: {
          event: newEvent,
        },
      });
    } catch (error) {
      // Clean up uploaded files in case of a server error
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(500).json({
        field: 'server',
        message: error.message,
      });
    }
  }
  // const {
  //   title, description, startDateTime, endDateTime,
  //   location, attendees, tags, media,
  //   isRecurring, recurrenceRule, catagory, status,
  // } = req.body;

  // if (!title) { return res.status(400).json({ error: 'Title is required' }); }
  // if (!description) { return res.status(400).json({ error: 'Description is required' }); }
  // if (!startDateTime) { return res.status(400).json({ error: 'StartDateTime is required' }); }
  // // if (!createdBy) { return res.status(400).json({ error: 'CreatedBy is required' }); }
  // if (!location || !validateLocation(location)) {
  //  return res.status(400).json({ error: 'Location is missing or not complete.' });
  // }
  // if (!tags) { return res.status(400).json({ error: 'Tags is required' }); }

  // try {
  //   const createdBy = req.user._id;
  //   const newEvent = new Event({
  //     title,
  //     description,
  //     location,
  //     startDateTime,
  //     endDateTime,
  //     createdBy,
  //     attendees,
  //     tags,
  //     media,
  //     catagory,
  //     status,
  //     recurrenceRule,
  //     isRecurring,
  //   });

  //   const event = await newEvent.save();
  //   // Update createdBy in User model
  //   await User.findByIdAndUpdate(
  //     createdBy,
  //     { $push: { createdEvents: event._id } },
  //     { new: true }, // Return the updated user
  //   );
  //   // Call setEventReminder() to set notification for 1 week and 1 day prior to event
  //   notificationController.setEventReminder(event.toObject());
  //   return res.status(201).json({ message: 'Event created successfully', newEvent });
  // } catch (error) {
  //   // console.error('Error occurred while creating event:', error);
  //   return res.status(500).json({ message: 'Error occured while creating event', error });
  // }

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
    const mediaDir = path.join(__dirname, '../public/media');
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(400).json({ errors: [{ field: 'server', message: 'Please provide appropriate Id' }] });
    }
    const event = await Event.findOne({ _id: id });
    if (!event) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(404).json({ errors: [{ field: 'server', message: 'Event not found' }] });
    }
    if (event.createdBy.toString() !== req.user._id.toString()) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(403).json({ errors: [{ field: 'server', message: 'You are not authorized to update this event' }] });
    }
    const {
      title, description, location,
      organizerAddress, organizerName,
      organizerEmail, startDateTime,
      endDateTime, category, status, tags,
    } = req.body;
    const media = req.file ? req.file.filename : null; // Get the filenames of uploaded files
    const errors = [];

    // Validate fields
    if (!title || !validator.isLength(title.trim(), { min: 1 })) {
      errors.push({ field: 'title', message: 'Title is required' });
    }
    if (!location || !validator.isLength(location.trim(), { min: 1 })) {
      errors.push({ field: 'location', message: 'Location is required' });
    }
    if (!description || !validator.isLength(description.trim(), { min: 1 })) {
      errors.push({ field: 'description', message: 'Description is required' });
    }
    if (!validator.isLength(organizerAddress.trim(), { min: 1 })) {
      errors.push({ field: 'organizerAddress', message: 'Valid organizer address is required' });
    }
    if (!validator.isLength(organizerName.trim(), { min: 1 })) {
      errors.push({ field: 'organizerName', message: 'Valid organizer name is required' });
    }
    if (!validator.isLength(organizerEmail.trim(), { min: 1 })) {
      errors.push({ field: 'organizerEmail', message: 'Valid organizer email is required' });
    }
    if (!validator.isEmail(organizerEmail) && !validator.isEmpty(organizerEmail.trim())) {
      errors.push({ field: 'organizerEmail', message: 'Valid organizer email is required' });
    }
    if (!startDateTime) {
      errors.push({ field: 'startDate', message: 'Start date-time is required' });
    }
    if (!endDateTime) {
      errors.push({ field: 'endDate', message: 'End date-time are required' });
    }
    if (startDateTime >= endDateTime && startDateTime && endDateTime) {
      errors.push({ field: 'startDate', message: 'End date-time must be after Start date-time' });
      errors.push({ field: 'endDate', message: 'End date-time must be after Start date-time' });
    }
    if (!category || !validator.isLength(category.trim(), { min: 1 })) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    if (!status || !validator.isLength(status.trim(), { min: 1 })) {
      errors.push({ field: 'status', message: 'Status is required' });
    }

    // Handle tags
    if (!tags || !validator.isLength(tags.trim(), { min: 1 })) {
      errors.push({ field: 'tags', message: 'Tags is required' });
    }

    if (errors.length > 0) {
      // Clean up uploaded files in case of validation errors
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(400).json({ errors });
    }

    try {
      // Update event fields
      event.title = title || event.title;
      event.description = description || event.description;
      event.location = location || event.location;
      event.organizer.address = organizerAddress || event.organizer.address;
      event.organizer.name = organizerName || event.organizer.name;
      event.organizer.email = organizerEmail || event.organizer.email;
      event.startDateTime = startDateTime || event.startDateTime;
      event.endDateTime = endDateTime || event.endDateTime;
      event.category = category || event.category;
      event.status = status || event.status;
      event.tags = tags ? tags.split(/[\s,]+/).map((tag) => tag.trim()).filter((tag) => tag.length > 0) : event.tags;
      if (media) {
        if (event.media) {
          fs.unlinkSync(path.join(mediaDir, event.media));
        }
        event.media = media;
      }

      await event.save();
      // Send email notification of event update
      notificationController.eventUpdate(event.toObject());
      return res.status(200).json({
        status: 'success',
        data: {
          event,
        },
      });
    } catch (error) {
      // Clean up uploaded files in case of a server error
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(500).json({
        field: 'server',
        message: error.message,
      });
    }
    // const { id } = req.params;
    // if (!id || validateId(id) === false){
    //  return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    // try {
    //   /* createdBy and attendees would need their own endpoints
    //    to be updated for security and convenience
    //    */
    //   const notAllowed = ['createdBy', 'attendees', '_id'];
    //   const reqBody = req.body;
    //   const entries = Object.entries(reqBody);
    //   const filteredEntries = entries.filter(([key]) => !notAllowed.includes(key));
    //   const filteredObj = Object.fromEntries(filteredEntries);
    //   const updatedEvent = await Event.findByIdAndUpdate(
    //     id,
    //     filteredObj,
    //     { new: true },
    //   );
    //   // Send email notification of event update
    //   notificationController.eventUpdate(updatedEvent.toObject());
    //   return res.json({ message: 'Event updated.', updatedEvent });
    // } catch (error) {
    //   return res.status(500).json({ message: 'Error occured while updating event', error });
    // }
  }

  static async deleteEvent(req, res) {
    const { id } = req.params;
    console.log(id);
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
      const userRegisteredEvents = await Event.find({ _id: { $in: user.registeredEvents } });
      // const notAllowed = ['createdBy', 'attendees', '_id'];
      // const filteredRegisteredEvents = userRegisteredEvents.map((event) => Object.fromEntries(
      //   Object.entries(event.toObject()).filter(([key]) => !notAllowed.includes(key)),
      // ));
      return res.json({ userRegisteredEvents });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while getting events', error });
    }
  }

  /** Gets all the events created by a user
   * Accessed through /api/events/myevents
  */
  static async getEventsByCreator(req, res) {
    const { user } = req;

    try {
      const notAllowed = [''];
      const myEvents = await Event.find({ _id: { $in: user.createdEvents } });
      // console.log(myEvents);
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
      const attendees = await User.find({ _id: { $in: event.toObject().attendees } });
      // console.log(attendees);

      if (attendees) {
        // Filter out unnecessary fields
        // const allowedFields = ['profile', 'userName', 'email', '_id'];
        // const filterdAttendees = attendees.map((attendee) => {
        //   const filteredAttendee = {};
        //   allowedFields.forEach((field) => {
        //     if (attendee[field]) {
        //       filteredAttendee[field] = attendee[field];
        //     }
        //   });
        //   return filteredAttendee;
        // });
        return res.json(attendees);
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
