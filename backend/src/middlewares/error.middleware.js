/**
 * Centralized error handler with safe JSON responses
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
