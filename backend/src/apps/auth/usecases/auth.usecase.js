/**
 * AuthUsecase: business logic for registration, login, profile
 */
import bcrypt from 'bcrypt';

class AuthUsecase {
  constructor(repository) {
    this.repo = repository;
  }

  /** Basic email/password validation */
  _validateCredentials(email, password) {
    const emailOk = typeof email === 'string' && /\S+@\S+\.\S+/.test(email.trim());
    const passOk = typeof password === 'string' && password.length >= 6;
    if (!emailOk) throw Object.assign(new Error('Invalid email format'), { statusCode: 400 });
    if (!passOk) throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
  }

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