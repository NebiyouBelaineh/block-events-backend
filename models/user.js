import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: false,
    unique: true,
  },
  profile: {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }], // Gets an array of events created by user
  registeredEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }], // Gets an array of events registered by user
});
const User = model('User', userSchema);

export default User;
