const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  location: { type: String }, // Optional field
  organizer: {
    address: { type: String },
    name: { type: String },
    email: { type: String }, // Removed email validation
  },
  startDateTime: { type: Date },
  endDateTime: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  media: [{ type: String }], // For storing media file URLs or identifiers
  category: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// Add indexes for performance optimization
eventSchema.index({ createdBy: 1 });
eventSchema.index({ startDateTime: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const eventSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   startDateTime: {
//     type: Date,
//     required: true,
//   },
//   endDateTime: {
//     type: Date,
//   },
//   location: {
//     type: String,
//     required: false,
//   },
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   organizer: {
//     name: {
//       type: String,
//       required: false,
//     },
//     email: {
//       type: String,
//       required: false,
//     },
//     phone: {
//       type: String,
//       required: false,
//     },
//   },
//   attendees: [{
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//   }],
//   tags: {
//     type: [String],
//     required: true,
//   },
//   media: {
//     pictures: [{ type: String }],
//     videos: [{ type: String }],
//   },
//   status: {
//     type: String,
//     enum: ['Scheduled', 'Cancelled', 'Completed'],
//     default: 'Scheduled',
//   },
//   category: {
//     type: String,
//   },
// });

// const Event = model('Event', eventSchema);
// export default Event;
