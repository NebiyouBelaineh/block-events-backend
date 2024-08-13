import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDateTime: { // Date and time when the event starts
    type: Date,
    required: true,
  },
  endDateTime: { // Date and time when the event ends
    type: Date,
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip_code: {
            type: String,
            required: false
        }
    },
    zip_code: {
      type: String,
    },
    googleMapsLink: { // Link to Google Maps location
      type: String,
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // ref is reference to the users in user model
    required: true,
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }], // ref is reference to the users in user model
  tags: {
    type: [String], // Array of tags as strings
    required: true,
  },
  media: {
    pictures: [{ type: String }], // Array of picture URLs
    videos: [{ type: String }], // Array of video URLs
  },
  status: { // Event status (e.g., 'Scheduled', 'Cancelled', 'Completed')
    type: String,
    enum: ['Scheduled', 'Cancelled', 'Completed'],
    default: 'Scheduled',
  },
  category: { // Category of the event (e.g., 'Concert', 'Workshop')
    type: String,
  },
  isRecurring: { // Flag for recurring events
    type: Boolean,
    default: false,
  },
  recurrenceRule: { // Recurrence rule if the event is recurring
    type: String,
  },
});

const Event = model('Event', eventSchema);
export default Event;
