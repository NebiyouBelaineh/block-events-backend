import User from '../models/user';
import { validateId } from '../services/Validators';

class UserController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createUser(req, res) {
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
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.json(user);
  }

  static async getAllUsers(req, res) {
    const users = await User.find().catch((error) => {
      res.json({ message: 'Error occured while getting users', error });
    });
    if (!users) {
      res.status(404).json({ error: 'Users not found' });
    } else {
      res.json({ users });
    }
  }

  static async updateUser(req, res) {
    const { id } = req.params;
    if (!id || validateId(id) === false) { return res.status(400).json({ error: 'Please provide appropriate Id' }); }

    const user = await User.findOne({ _id: id });
    if (!user) { return res.status(404).json({ error: 'User not found' }); }

    try {
      /* password, email, _id , creadEvents and registerdEvents would need
       their own endpoints to be updated for security and convenience
       */
      const notAllowed = ['password', 'email', '_id', 'createdEvents', 'registeredEvents'];
      const reqBody = req.body;
      const entries = Object.entries(reqBody);
      const filteredEntries = entries.filter(([key]) => !notAllowed.includes(key));
      const filteredObj = Object.fromEntries(filteredEntries);
      const updatedInfo = await User.findByIdAndUpdate(
        id,
        filteredObj,
        { new: true }, // Return the updated user
      );
      return res.json({ message: 'User updated', updatedInfo });
    } catch (error) {
      return res.status(500).json({ message: 'Error occured while updating user', error });
    }
  }

  // Only for admin
  static async deleteUser(req, res) {
    res.send('User deleted');
  }
}

export default UserController;
