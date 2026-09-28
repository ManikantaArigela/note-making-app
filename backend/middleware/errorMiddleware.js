export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected server error occurred';

  // Handle Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Resource not found or invalid ID format: ${err.value}`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = `Validation Error: ${errors.join(', ')}`;
  }

  // Handle Mongo Network / Timeout Errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    statusCode = 503;
    message = 'Database connection temporarily unavailable. Retrying...';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

