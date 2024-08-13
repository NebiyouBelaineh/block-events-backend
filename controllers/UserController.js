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
    const { id } = req.params;
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    const user = await User.findOne({ _id: id });
    if (!user) { return res.status(404).json({ error: 'User not found' }); }

    try {
      const reqBody = req.body;
      let filteredObj = Object.fromEntries(
        Object.entries(reqBody).filter(([key]) => allowed.includes(key)),
      );
      const updatedInfo = await User.findByIdAndUpdate(
        id,
        filteredObj,
        { new: true }, // Return the updated user
      );

      filteredObj = Object.fromEntries(
        Object.entries(updatedInfo.toObject()).filter(([key]) => allowed.includes(key)),
      );
      return res.json({ message: 'User updated', filteredObj });
    } catch (error) {
      return res.status(500).json({ message: 'Error occured while updating user', error });
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
