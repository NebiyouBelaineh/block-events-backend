import User from '../models/user';

class UserController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createUser(req, res) {
    const { userName, email, password } = req.query;
    res.send(`User created with: ${userName}, ${email}, ${password}`);
  }

  static async getUser(req, res) {
    const { id } = req.params;
    res.send(`User with id: ${id} requested.`);
  }

  static async updateUser(req, res) {
    const { userName, email, password } = req.query;
    res.json({ message: `User updated with: ${userName}, ${email}, ${password}` });
  }

  // Only for admin
  static async deleteUser(req, res) {
    res.send('User deleted');
  }
}

export default UserController;
