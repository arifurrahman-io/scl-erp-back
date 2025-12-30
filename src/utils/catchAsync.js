/**
 * Wraps an async function to catch errors and forward them to the global error middleware.
 * This eliminates the need for repetitive try-catch blocks in controllers.
 *
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Ensure fn(req, res, next) returns a promise and catch any rejection
    //
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Log error internally if needed before passing to next middleware
      //
      next(err);
    });
  };
};

module.exports = catchAsync;
