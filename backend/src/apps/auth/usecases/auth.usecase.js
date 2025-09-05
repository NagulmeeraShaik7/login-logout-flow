/**
 * AuthUsecase
 *
 * Business logic for authentication workflows:
 * - User registration
 * - User login
 * - Profile retrieval
 *
 * Uses a repository for database access and bcrypt for password hashing.
 *
 * @class
 */
import bcrypt from 'bcrypt';

class AuthUsecase {
  /**
   * Create a new AuthUsecase instance.
   *
   * @constructor
   * @param {Object} repository - The repository used for user persistence (must implement `findByEmail`, `findById`, `createUser`).
   */
  constructor(repository) {
    this.repo = repository;
  }

  /**
   * Validate email and password format.
   *
   * @private
   * @function _validateCredentials
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @throws {Error} If email format is invalid or password is too short (statusCode: 400).
   *
   * @example
   * this._validateCredentials("user@example.com", "securePass");
   */
  _validateCredentials(email, password) {
    const emailOk = typeof email === 'string' && /\S+@\S+\.\S+/.test(email.trim());
    const passOk = typeof password === 'string' && password.length >= 6;
    if (!emailOk) throw Object.assign(new Error('Invalid email format'), { statusCode: 400 });
    if (!passOk) throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
  }

  /**
   * Register a new user.
   *
   * @async
   * @function register
   * @memberof AuthUsecase
   * @param {Object} params - Registration details.
   * @param {string} params.email - The user's email.
   * @param {string} params.password - The user's plain-text password.
   * @returns {Promise<{id: number, email: string, created_at: string}>} The newly created user (without password).
   * @throws {Error} If validation fails (400) or email is already registered (409).
   *
   * @example
   * const newUser = await usecase.register({ email: "new@example.com", password: "securePass" });
   */
  async register({ email, password }) {
    this._validateCredentials(email, password);

    const existing = await this.repo.findByEmail(email.trim().toLowerCase());
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await this.repo.createUser({
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    return { id: user.id, email: user.email, created_at: user.created_at };
  }

  /**
   * Authenticate a user by email and password.
   *
   * @async
   * @function login
   * @memberof AuthUsecase
   * @param {Object} params - Login details.
   * @param {string} params.email - The user's email.
   * @param {string} params.password - The user's plain-text password.
   * @returns {Promise<{id: number, email: string}>} Authenticated user info.
   * @throws {Error} If validation fails (400) or credentials are invalid (401).
   *
   * @example
   * const user = await usecase.login({ email: "user@example.com", password: "securePass" });
   */
  async login({ email, password }) {
    this._validateCredentials(email, password);

    const user = await this.repo.findByEmail(email.trim().toLowerCase());
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    return { id: user.id, email: user.email };
  }

  /**
   * Retrieve a user's profile by ID.
   *
   * @async
   * @function getProfile
   * @memberof AuthUsecase
   * @param {number} userId - The ID of the user.
   * @returns {Promise<{id: number, email: string, created_at: string, updated_at: string}>} User profile data.
   * @throws {Error} If user is not found (404).
   *
   * @example
   * const profile = await usecase.getProfile(1);
   */
  async getProfile(userId) {
    const user = await this.repo.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return { id: user.id, email: user.email, created_at: user.created_at, updated_at: user.updated_at };
  }
}

export default AuthUsecase;
