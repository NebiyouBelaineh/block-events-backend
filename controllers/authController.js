// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from 'jsonwebtoken';
// eslint-disable-next-line import/no-extraneous-dependencies
import validator from 'validator';
import { promisify } from 'util';
import User from '../models/user';
import AppError from '../util/appError';

class AuthController {
  static async register(req, res) {
    const {
      userName, email, password, passwordConfirm,
    } = req.body;
    const errors = [];

    if (!email || validator.isEmpty(email.trim())) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!userName || validator.isEmpty(userName.trim())) {
      errors.push({ field: 'userName', message: 'Username is required' });
    }
    if (!password || validator.isEmpty(password.trim())) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
    if (!passwordConfirm || validator.isEmpty(passwordConfirm.trim())) {
      errors.push({ field: 'passwordConfirm', message: 'PasswordConfirm is required' });
    }
    if (!validator.isLength(password, { min: 8 }) && !validator.isEmpty(password.trim())) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    if (!validator.isEmail(email) && !validator.isEmpty(email.trim())) {
      errors.push({ field: 'email', message: 'Email is invalid' });
    }
    if (password !== passwordConfirm) {
      errors.push({ field: 'passwordConfirm', message: 'Passwords do not match' });
    }
    const user = await User.findOne({ userName });
    if (user) {
      errors.push({ field: 'userName', message: 'Username already exists' });
    }
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      errors.push({ field: 'email', message: 'Email already exists' });
    }
    if (errors.length > 0) {
      return res.status(400).json({
        errors,
      });
    }
    try {
      const newUser = await User.create({
        userName,
        email,
        password,
        passwordConfirm,
        profile: {
          firstName: '',
          lastName: '',
          bio: '',
          avatar: '',
        },
      });

      const token = AuthController.signToken(newUser._id);
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      newUser.password = undefined;
      return res.status(201).json({
        status: 'success',
        token,
        data: {
          user: newUser,
        },
      });
    } catch (error) {
      return res.status(500).json({
        field: 'server',
        message: error.message,
      });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const errors = [];

    if (!email || validator.isEmpty(email.trim())) {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!password || validator.isEmpty(password.trim())) {
      errors.push({ field: 'password', message: 'Password is required' });
    }
    if (!validator.isEmail(email) && !validator.isEmpty(email.trim())) {
      errors.push({ field: 'email', message: 'Email is invalid' });
    }

    try {
      console.log(errors);
      const user = await User.findOne({ email }).select('+password');
      if ((!user || !await user.correctPassword(password, user.password)) && errors.length === 0) {
        errors.push({ field: 'server', message: 'Incorrect email or password' });
        return res.status(401).json({
          errors,
        });
      }
      if (errors.length > 0) {
        return res.status(400).json({
          errors,
        });
      }
      const token = AuthController.signToken(user._id);
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(200).json({
        status: 'success',
        token,
      });
    } catch (error) {
      return res.status(500).json({
        field: 'server',
        message: error.message,
      });
    }
  }

  static async protect(req, res, next) {
    try {
      const token = (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1] : undefined);
      if (!token) {
        return res.status(401).json({ errors: [{ field: 'server', message: 'You are not logged in' }] });
      }
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res.status(401).json({ errors: [{ field: 'server', message: 'The user no longer exists' }] });
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({ errors: [{ field: 'server', message: 'User recently changed password. Please log in again' }] });
      }
      req.user = currentUser;
      return next();
    } catch (error) {
      return res.status(401).json({ errors: [{ field: 'server', message: 'User recently changed password. Please log in again' }] });
    }
  }

  static restrict(...roles) {
    return (req, res, next) => {
      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }

      return next();
    };
  }

  static logout(req, res) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 1 * 1000),
      httpOnly: true,
    });
    console.log('Logged out');
    return res.status(200).json({ status: 'success' });
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await User.find();
      return res.status(200).json({
        status: 'success',
        data: {
          users,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  static async check(req, res) {
    const token = (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1] : undefined);
    if (!token) {
      console.log('No token found');
      return res.status(200).json({ isAuthenticated: false, error: 'No token found' });
    }
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        console.log('User not found');
        return res.status(200).json({ isAuthenticated: false, error: 'User not found' });
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        console.log('User recently changed password');
        return res.status(200).json({ isAuthenticated: false, error: 'User recently changed password. Please log in again' });
      }
      // console.log(currentUser);
      return res.status(200).json({ isAuthenticated: true, user: currentUser });
    } catch (error) {
      console.log(error.message);
      return res.status(200).json({ isAuthenticated: false, error: 'Invalid token' });
    }
  }
}

export default AuthController;
