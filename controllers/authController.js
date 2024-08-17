// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/user';
import AppError from '../util/appError';

class AuthController {
  static async register(req, res, next) {
    try {
      const newUser = await User.create(req.body);

      const token = AuthController.signToken(newUser._id);
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      // delete the password from the returned object
      newUser.password = undefined;
      return res.status(201).json({
        status: 'success',
        token,
        data: {
          user: newUser,
        },
      });
    } catch (error) {
      //   return res.status(500).json({
      //     status: 'fail',
      //     message: error.message,
      //     type: error.stack,
      //   });
      return next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
      }
      const token = AuthController.signToken(user._id);
      res.cookie('jwt', token, {
        // Set to expire in minutes
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(200).json({
        status: 'success',
        token,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async protect(req, res, next) {
    try {
      const token = (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1] : undefined);
      // console.log(token, req.headers.authorization);
      if (!token) {
        return next(new AppError('You are not logged in', 401));
      }
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(new AppError('The user no longer exists', 401));
      }
      // check if the user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again', 401));
      }
      req.user = currentUser;
      return next();
    } catch (error) {
      return next(error);
    }
  }

  static restrict(...roles) {
    return (req, res, next) => {
      // Implement the logic here
      const userRole = req.user.role; // Assuming req.user contains the user's role

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
      // check if the user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        console.log('User recently changed password');
        return res.status(200).json({ isAuthenticated: false, error: 'User recently changed password. Please log in again' });
      }
      return res.status(200).json({ isAuthenticated: true });
    } catch (error) {
      console.log(error.message);
      return res.status(200).json({ isAuthenticated: false, error: 'Invalid token' });
    }
  }
}

export default AuthController;
