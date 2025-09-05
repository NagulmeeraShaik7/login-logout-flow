/**
 * @file auth.usecase.test.js
 * Unit tests for AuthUsecase class
 */

import AuthUsecase from '../usecases/auth.usecase.js';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthUsecase', () => {
  let repo;
  let usecase;

  beforeEach(() => {
    repo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    };
    usecase = new AuthUsecase(repo);

    jest.clearAllMocks();
  });

  describe('_validateCredentials', () => {
    it('should pass with valid email and password', () => {
      expect(() => usecase._validateCredentials('test@test.com', 'secret1')).not.toThrow();
    });

    it('should throw on invalid email', () => {
      expect(() => usecase._validateCredentials('invalid', 'secret1')).toThrow('Invalid email format');
    });

    it('should throw on short password', () => {
      expect(() => usecase._validateCredentials('test@test.com', '123')).toThrow(
        'Password must be at least 6 characters'
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      repo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpw');
      repo.createUser.mockResolvedValue({
        id: 1,
        email: 'new@test.com',
        created_at: '2025-09-05',
      });

      const result = await usecase.register({ email: 'new@test.com', password: 'password' });

      expect(repo.findByEmail).toHaveBeenCalledWith('new@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(repo.createUser).toHaveBeenCalledWith({
        email: 'new@test.com',
        passwordHash: 'hashedpw',
      });
      expect(result).toEqual({
        id: 1,
        email: 'new@test.com',
        created_at: '2025-09-05',
      });
    });

    it('should throw if email already exists', async () => {
      repo.findByEmail.mockResolvedValue({ id: 1, email: 'exists@test.com' });

      await expect(
        usecase.register({ email: 'exists@test.com', password: 'password' })
      ).rejects.toThrow('Email already registered');
    });

    it('should throw if validation fails', async () => {
      await expect(usecase.register({ email: 'bademail', password: 'short' })).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should log in with correct credentials', async () => {
      repo.findByEmail.mockResolvedValue({
        id: 2,
        email: 'me@test.com',
        password_hash: 'hashedpw',
      });
      bcrypt.compare.mockResolvedValue(true);

      const result = await usecase.login({ email: 'me@test.com', password: 'password' });

      expect(repo.findByEmail).toHaveBeenCalledWith('me@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpw');
      expect(result).toEqual({ id: 2, email: 'me@test.com' });
    });

    it('should throw if user not found', async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(usecase.login({ email: 'missing@test.com', password: 'password' })).rejects.toThrow(
        'Invalid credentials'
      );
    });

it('should throw if password does not match', async () => {
  repo.findByEmail.mockResolvedValue({
    id: 2,
    email: 'me@test.com',
    password_hash: 'hashedpw',
  });
  bcrypt.compare.mockResolvedValue(false);

  // ✅ Use a 6+ char password so validation passes
  await expect(usecase.login({ email: 'me@test.com', password: 'wrongpw' }))
    .rejects.toThrow('Invalid credentials');
});


    it('should throw if validation fails', async () => {
      await expect(usecase.login({ email: 'bademail', password: '123' })).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return profile if found', async () => {
      const fakeUser = {
        id: 3,
        email: 'user@test.com',
        created_at: '2025-09-05',
        updated_at: '2025-09-05',
      };
      repo.findById.mockResolvedValue(fakeUser);

      const result = await usecase.getProfile(3);

      expect(repo.findById).toHaveBeenCalledWith(3);
      expect(result).toEqual(fakeUser);
    });

    it('should throw if user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(usecase.getProfile(99)).rejects.toThrow('User not found');
    });
  });
});
