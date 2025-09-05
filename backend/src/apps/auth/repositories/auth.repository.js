/**
 * AuthRepository
 *
 * Data access layer for managing users in the authentication system.
 * Provides methods to query and persist user records in the SQLite database.
 *
 * @class
 */
import { getDb } from '../models/auth.model.js';

class AuthRepository {
  /**
   * Create a new instance of AuthRepository.
   * 
   * @constructor
   */
  constructor() {}

  /**
   * Find a user by their email address.
   *
   * @async
   * @function findByEmail
   * @memberof AuthRepository
   * @param {string} email - The email address to search for.
   * @returns {Promise<object|null>} Resolves with the user record if found, otherwise `null`.
   *
   * @example
   * const user = await repo.findByEmail("test@example.com");
   */
  async findByEmail(email) {
    const db = await getDb();
    return db.get(
      `SELECT id, email, password_hash, created_at, updated_at 
       FROM users 
       WHERE email = ?`,
      [email]
    );
  }

  /**
   * Find a user by their unique ID.
   *
   * @async
   * @function findById
   * @memberof AuthRepository
   * @param {number} id - The ID of the user to fetch.
   * @returns {Promise<object|null>} Resolves with the user record if found, otherwise `null`.
   *
   * @example
   * const user = await repo.findById(1);
   */
  async findById(id) {
    const db = await getDb();
    return db.get(
      `SELECT id, email, password_hash, created_at, updated_at 
       FROM users 
       WHERE id = ?`,
      [id]
    );
  }

  /**
   * Create a new user in the database.
   *
   * @async
   * @function createUser
   * @memberof AuthRepository
   * @param {Object} params - The user details.
   * @param {string} params.email - The user's email address.
   * @param {string} params.passwordHash - The hashed password for the user.
   * @returns {Promise<object>} Resolves with the newly created user record.
   *
   * @throws {Error} Throws an error if the email is already taken (due to UNIQUE constraint).
   *
   * @example
   * const newUser = await repo.createUser({
   *   email: "newuser@example.com",
   *   passwordHash: "hashed_password_here"
   * });
   */
  async createUser({ email, passwordHash }) {
    const db = await getDb();
    // Use a single INSERT to leverage unique index constraint
    const result = await db.run(
      `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
      [email, passwordHash]
    );
    return this.findById(result.lastID);
  }
}

export default AuthRepository;
