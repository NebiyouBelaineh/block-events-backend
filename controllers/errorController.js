import AppError from '../util/appError';

const handleErrorDb = () => new AppError('Duplicate key error', 500);
const handleJWTError = () => new AppError('Invalid token. Please log in again', 401);
const handleJWTExpired = () => new AppError('Your token has expired. Please log in again', 401);
const handlePasswordMinLength = () => new AppError('Password is shorter than the minimum allowed length (8)', 401);

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';
  error.message = err.message;
  error.stack = err.stack;
  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: err,
      message: error.message,
      stack: error.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    if (err.code === 11000) error = handleErrorDb();
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();
    if (error.errors) {
      if (error.errors.password.path === 'password' && error.errors.password.kind === 'minlength') error = handlePasswordMinLength();
    }
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // 1) log error
      console.error('Error 💥', error);
      // end generric message
      res.status(500).json({
        status: 'fail',
        message: 'Something went wrong',
      });
    }
  }

  next();
};
