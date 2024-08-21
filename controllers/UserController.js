import path from 'path';
import fs from 'fs';
import validator from 'validator';
import User from '../models/user';
import Event from '../models/events';
import { validateId } from '../services/Validators';

const allowed = ['userName', 'profile', 'email'];

class UserController {
  static async createUser(req, res) {
    const { user } = req;
    const {
      userName, email, password, profile,
    } = req.body;
    if (!email) { return res.status(400).json({ error: 'Email is required' }); }
    if (!password) { return res.status(400).json({ error: 'Password is required' }); }

    try {
      const newUser = new User({
        userName: userName || email,
        email,
        password,
        profile,
      });

      await newUser.save();
      if (user.toObject().role === 'user') {
        const filtered = Object.fromEntries(
          Object.entries(newUser.toObject()).filter(([key]) => allowed.includes(key)),
        );
        return res.status(201).json({ message: 'User created successfully.', newUser: filtered });
      }
      return res.status(201).json({ message: 'User created successfully.', newUser });
    } catch (error) {
      return res.status(500).json({ message: 'Error occured while creating user', error });
    }
  }

  static async getUserById(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    const user = await User.findOne({ _id: id })
      .catch((error) => (res.status(500).json({ error: `Error occured while finding user: ${error.message} ` })));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.toObject().role === 'user') {
      const filteredUser = Object.fromEntries(
        Object.entries(user.toObject()).filter(([key]) => allowed.includes(key)),
      );
      return res.json({ user: filteredUser });
    }
    return res.json({ user });
  }

  /** Gets all users
   * This Route may need protection and should only be for admin
    */
  static async getAllUsers(req, res) {
    const users = await User.find().catch((error) => {
      res.json({ message: 'Error occured while getting users', error });
    });
    if (!users) {
      res.status(404).json({ error: 'Users not found' });
    } else {
      res.json({ users }); // Admin Response
    }
  }

  static async updateUser(req, res) {
    const mediaDir = path.join(__dirname, '../public/media');
    const { id } = req.params;
    if (!id || validateId(id) === false) {
      return res.status(400).json({ errors: [{ field: 'server', message: 'Please provide appropriate Id' }] });
    }
    const user = await User.findOne({ _id: id }).select('+password');
    if (!user) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(404).json({ errors: [{ field: 'server', message: 'User not found' }] });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(403).json({ errors: [{ field: 'server', message: 'You are not authorized to update this user' }] });
    }
    const {
      userName, email, currentPassword, newPassword,
      firstName, lastName, bio, confirmPassword,
    } = req.body;
    const avatar = req.file ? req.file.filename : null;
    const errors = [];
    console.log(req.body);
    if (!userName || validator.isEmpty(userName.trim())) {
      errors.push({ field: 'userName', message: 'Username is required' });
    }
    if (validator.isEmpty(email.trim())) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!validator.isEmail(email) && !validator.isEmpty(email.trim())) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (currentPassword && !validator.isEmpty(currentPassword.trim())) {
      if (!await user.correctPassword(currentPassword, user.password)) {
        if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
        errors.push({ field: 'currentPassword', message: 'Current password is incorrect' });
        return res.status(400).json({ errors });
      }
      if (!newPassword && validator.isEmpty(newPassword.trim())) {
        errors.push({ field: 'newPassword', message: 'New password is required' });
      }
      if (!confirmPassword && validator.isEmpty(confirmPassword.trim())) {
        errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
      }
      if (!validator.isLength(newPassword, { min: 8 }) && !validator.isEmpty(newPassword.trim())) {
        errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters' });
      }
      if (errors.length > 0) {
        if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
        return res.status(400).json({ errors });
      }
      if (newPassword !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Confirm password does not match' });
      }
      if (errors.length > 0) {
        if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
        return res.status(400).json({ errors });
      }
      user.password = newPassword;
      user.confirmPassword = confirmPassword;
    } else if (newPassword || confirmPassword) {
      errors.push({ field: 'currentPassword', message: 'Current password is required' });
      return res.status(400).json({ errors });
    }

    if (errors.length > 0) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(400).json({ errors });
    }
    try {
      user.userName = userName || user.userName;
      user.email = email || user.email;
      user.profile.firstName = firstName || user.profile.firstName;
      user.profile.lastName = lastName || user.profile.lastName;
      user.profile.bio = bio || user.profile.bio;
      // user.profile.avatar = avatar || user.profile.avatar;
      if (avatar) {
        if (user.profile.avatar && user.profile.avatar !== 'profile.png') {
          if (fs.existsSync(path.join(mediaDir, user.profile.avatar))) {
            fs.unlinkSync(path.join(mediaDir, user.profile.avatar));
          }
        }
        user.profile.avatar = avatar;
      }
      await user.save();
      user.password = undefined;
      return res.json({ message: 'User updated', user });
    } catch (error) {
      if (req.file) fs.unlinkSync(path.join(mediaDir, req.file.filename));
      return res.status(500).json({ errors: [{ field: 'server', message: 'Error occured while updating user' }] });
    }
  }

  // Only for admin
  static async deleteUser(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete events created by the user
      await Event.deleteMany({ createdBy: id });

      // Remove the user from attendees in all events
      await Event.updateMany(
        { attendees: id },
        { $pull: { attendees: id } },
      );

      // Delete the user
      await User.findOneAndDelete(id);

      return res.json({ message: 'User and related data deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred while deleting user', error });
    }
  }
}

export default UserController;
