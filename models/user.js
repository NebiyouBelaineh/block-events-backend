import mongoose from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  userName: {
    type: String,
    required: false,
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
    required: false,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: false,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  createdEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }], // Gets an array of events created by user
  registeredEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }], // Gets an array of events registered by user
});

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  return next();
});

userSchema.methods.correctPassword = async function correctPass(
  candidatePassword,
  userPassword,
) {
  console.log('candidate', candidatePassword, 'user', userPassword);
  const isMatch = await bcrypt.compare(candidatePassword, userPassword);
  return isMatch;
};

userSchema.methods.changedPasswordAfter = function changePassAfter(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
const User = model('User', userSchema);

export default User;
