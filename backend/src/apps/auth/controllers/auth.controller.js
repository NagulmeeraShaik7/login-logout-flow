/**
 * AuthController
 * 
 * Express controller class handling authentication operations such as 
 * user registration, login, fetching the current authenticated user, 
 * and logout. Works with session-based authentication.
 * 
 * @class
 */
import AuthRepository from '../repositories/auth.repository.js';
import AuthUsecase from '../usecases/auth.usecase.js';

class AuthController {
  /**
   * Initializes the AuthController with AuthRepository and AuthUsecase.
   * Binds handler methods to the controller instance for use with Express routes.
   */
  constructor() {
    const repo = new AuthRepository();
    this.usecase = new AuthUsecase(repo);

    // Bind methods for router usage
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Register a new user.
   * 
   * @async
   * @function register
   * @memberof AuthController
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * 
   * @description 
   * Handles POST `/api/auth/register`.
   * Expects `email` and `password` in the request body. 
   * Creates a new user and optionally starts a session (auto-login).
   * 
   * @returns {Promise<void>} JSON response containing a success message and the created user.
   */
  async register(req, res, next) {
    try {
      const { email, password } = req.body || {};
      const user = await this.usecase.register({ email, password });

      // Auto-login after register (optional).
      req.session.userId = user.id;

      res.status(201).json({ message: 'Registered successfully', user });
    } catch (err) {
      if (err && !err.statusCode) err.statusCode = 400;
      next(err);
    }
  }

  /**
   * Authenticate and log in a user.
   * 
   * @async
   * @function login
   * @memberof AuthController
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * 
   * @description 
   * Handles POST `/api/auth/login`.
   * Expects `email` and `password` in the request body. 
   * On success, stores the user ID in session.
   * 
   * @returns {Promise<void>} JSON response containing a success message and the logged-in user.
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
   * Get the profile of the currently authenticated user.
   * 
   * @async
   * @function me
   * @memberof AuthController
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * 
   * @description 
   * Handles GET `/api/auth/me`.
   * Fetches the profile of the logged-in user using the session userId.
   * Throws an error if the user is not authenticated.
   * 
   * @returns {Promise<void>} JSON response containing the authenticated user's profile.
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
   * Log out the currently authenticated user.
   * 
   * @async
   * @function logout
   * @memberof AuthController
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * 
   * @description 
   * Handles POST `/api/auth/logout`.
   * Destroys the user session and clears the authentication cookie.
   * 
   * @returns {Promise<void>} JSON response confirming the logout.
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
