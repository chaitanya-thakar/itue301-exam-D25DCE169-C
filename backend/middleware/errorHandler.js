/**
 * Global Error Handling Middleware
 * Formats errors into structured JSON responses instead of raw stacks.
 * Handles Mongoose ValidationErrors, CastErrors, Duplicate Key errors, and general 500 errors.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let validationErrors = null;

  if (res.statusCode && res.statusCode >= 400 && res.statusCode < 600) {
    statusCode = res.statusCode;
  }

  // Handle Mongoose Validation Error (Task 5)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    validationErrors = Object.values(err.errors).map((item) => item.message);
    message = validationErrors.join('; ');
  } 
  // Handle Mongoose CastError (e.g. Invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  } 
  // Handle MongoDB Duplicate Key Error (code 11000)
  else if (err.code === 11000) {
    statusCode = 400;
    const fields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate field value entered for [${fields}]. It must be unique.`;
  } 
  // Handle explicit status errors passed down
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: validationErrors || undefined,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
