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
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  media: { type: String }, // For storing media file URLs or identifiers
  category: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// Add indexes for performance optimization
eventSchema.index({ createdBy: 1 });
eventSchema.index({ startDateTime: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
