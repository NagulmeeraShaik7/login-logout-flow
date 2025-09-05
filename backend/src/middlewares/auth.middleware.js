/**
 * Simple session-based guard for protected routes
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
