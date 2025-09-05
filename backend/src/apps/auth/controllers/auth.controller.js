/**
 * AuthController: Express handlers (class-based)
 */
import AuthRepository from '../repositories/auth.repository.js';
import AuthUsecase from '../usecases/auth.usecase.js';

class AuthController {
  constructor() {
    const repo = new AuthRepository();
    this.usecase = new AuthUsecase(repo);

    // Bind methods for router
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * POST /api/auth/register
   * body: { email, password }
   */
  async register(req, res, next) {
    try {
      const { email, password } = req.body || {};
      const user = await this.usecase.register({ email, password });

      // Auto-login after register (optional). Comment out if not desired.
      req.session.userId = user.id;

      res.status(201).json({ message: 'Registered successfully', user });
    } catch (err) {
      if (err && !err.statusCode) err.statusCode = 400;
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * body: { email, password }
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};
      const user = await this.usecase.login({ email, password });

      req.session.userId = user.id;

      res.json({ message: 'Logged in', user });
    } catch (err) {
      if (!err.statusCode) err.statusCode = 401;
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   * returns session user profile
   */
  async me(req, res, next) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        const e = new Error('Not authenticated');
        e.statusCode = 401;
        throw e;
      }
      const profile = await this.usecase.getProfile(userId);
      res.json({ user: profile });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   * destroys session
   */
  async logout(req, res, next) {
    try {
      if (!req.session) return res.json({ message: 'Logged out' });
      req.session.destroy((error) => {
        if (error) {
          const e = new Error('Failed to destroy session');
          e.statusCode = 500;
          return next(e);
        }
        // Clear cookie on client
        res.clearCookie(process.env.SESSION_NAME || 'sid', {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
        return res.json({ message: 'Logged out' });
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
