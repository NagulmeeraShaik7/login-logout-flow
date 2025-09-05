/**
 * Middleware: requireAuth
 *
 * Simple session-based authentication guard for protecting routes.
 * Ensures that a valid session with a `userId` exists before proceeding.
 *
 * @function requireAuth
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * 
 * @returns {void}
 *
 * @throws {Error} If no valid session is found, an `Error` with statusCode 401 is passed to `next()`.
 *
 * @example
 * import requireAuth from './middlewares/auth.middleware.js';
 *
 * // Protect a route
 * app.get('/profile', requireAuth, (req, res) => {
 *   res.json({ message: "This is a protected route" });
 * });
 */
export default function requireAuth(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      return next();
    }
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    return next(err);
  } catch (err) {
    return next(err);
  }
}
