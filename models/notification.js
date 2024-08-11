import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const notificationSchema = new Schema({
  eventId: {
      type: Schema.Types.ObjectId,
      required: false,
  },
  timeLeft: {
      type: String,
      enum: ['day', 'week']
  },
  dueDate: {
      type: Date,
      required: true
  }
});

const Notification = model('Notification', notificationSchema);
export default Notification;
