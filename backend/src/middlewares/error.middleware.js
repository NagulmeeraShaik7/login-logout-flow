/**
 * Error Handling Middleware
 *
 * Centralized Express error handler that returns safe JSON responses.
 * Prevents exposing internal details to clients while allowing custom
 * `statusCode` and `message` from thrown errors.
 *
 * @function errorHandler
 * @param {Error & {statusCode?: number}} err - The error object (may contain a custom `statusCode`).
 * @param {import('express').Request} _req - Express request object (unused).
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} _next - Express next middleware function (unused).
 *
 * @returns {void} Sends a JSON error response with appropriate HTTP status.
 *
 * @example
 * // Usage in app.js
 * import errorHandler from './middlewares/error.middleware.js';
 * app.use(errorHandler);
 *
 * // Example thrown error
 * const err = new Error("Invalid request");
 * err.statusCode = 400;
 * throw err;
 *
 * // Response:
 * // {
 * //   "error": { "message": "Invalid request" }
 * // }
 */
export default function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    error: {
      message:
        status === 500
          ? 'Internal Server Error'
          : err.message || 'Something went wrong',
    },
  };

  res.status(status).json(payload);
}
