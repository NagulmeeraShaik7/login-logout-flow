/**
 * AuthRepository: data access layer for users
 */
import { getDb } from '../models/auth.model.js';

class AuthRepository {
  constructor() {}

  async findByEmail(email) {
    const db = await getDb();
    return db.get(`SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = ?`, [email]);
  }

  async findById(id) {
    const db = await getDb();
    return db.get(`SELECT id, email, password_hash, created_at, updated_at FROM users WHERE id = ?`, [id]);
  }

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