/**
 * Beginner-friendly Error Handling Middleware
 * 
 * This middleware catches any errors that happen in our routes
 * and sends a clean, understandable response to the frontend.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err.message);

  // Determine the status code. If it's already set (e.g. 400), use it.
  // Otherwise, default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // In a real production app, we would hide the stack trace, 
    // but it's helpful for learning and debugging!
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
