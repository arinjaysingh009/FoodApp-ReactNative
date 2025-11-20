// Centralized error handling middleware

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found error handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`Duplicate field value: ${field}. Please use another value`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again', 401);
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const match = err.detail.match(/Key \((.+)\)=/);
    const field = match ? match[1] : 'field';
    error = new AppError(`Duplicate ${field}. This ${field} is already in use`, 400);
  }

  if (err.code === '23503') { // Foreign key violation
    error = new AppError('Referenced resource does not exist', 400);
  }

  if (err.code === '22P02') { // Invalid text representation
    error = new AppError('Invalid data format', 400);
  }

  // Multer errors (handled separately, but can be caught here too)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File size too large', 400);
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new AppError('Too many files uploaded', 400);
    } else {
      error = new AppError('File upload error', 400);
    }
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    error = new AppError(`Payment processing error: ${err.message}`, 400);
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

// Async handler wrapper to catch errors in async functions
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.param,
    message: error.msg
  }));
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  formatValidationErrors
};
