import User from '../models/user';

class UserController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createUser(req, res) {
    const {
      userName, email, password, profile,
    } = req.body;
    if (!email) { res.status(400).json({ error: 'Email is required' }); }
    if (!password) { res.status(400).json({ error: 'Password is required' }); }

    const newUser = new User({
      userName: userName || email,
      email,
      password,
      profile,
    });

    await newUser.save().then((user) => res.json(user)).catch((error) => {
      res.json({ message: 'Error occured while saving user', error });
    });
  }

  static async getUserById(req, res) {
    const { id } = req.params;
    if (!id) { res.status(400).json({ error: 'ID is required' }); }

    const user = await User.findOne({ _id: id }).catch((error) => {
      res.json({ message: 'Error occured while getting user', error });
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ user });
    }
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
    if (!id) { res.status(400).json({ error: 'ID is required' }); }

    const user = await User.findOne({ _id: id });
    if (!user) { res.status(404).json({ error: 'User not found' }); }

    // password and email would need their own handler to update for security reasons
    const notAllowed = ['password', 'email'];
    const reqBody = req.body;
    const entries = Object.entries(reqBody);
    const filteredEntries = entries.filter(([key]) => !notAllowed.includes(key));
    const filteredObj = Object.fromEntries(filteredEntries);
    console.log(filteredObj);
    const updatedInfo = await User.findByIdAndUpdate(
      id,
      filteredObj,
      { new: true }, // Return the updated user
    );
    res.json({ message: 'User information updated', updatedInfo });
  }

  // Only for admin
  static async deleteUser(req, res) {
    res.send('User deleted');
  }
}

export default UserController;
