/**
 * @file auth.repository.test.js
 * Unit tests for AuthRepository class
 */

import AuthRepository from '../repositories/auth.repository.js';
import { getDb } from '../models/auth.model.js';

jest.mock('../models/auth.model.js'); // mock the DB connection

describe('AuthRepository', () => {
  let repo;
  let mockDb;

  beforeEach(() => {
    repo = new AuthRepository();

    // fresh mock db object for each test
    mockDb = {
      get: jest.fn(),
      run: jest.fn(),
    };

    getDb.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const fakeUser = { id: 1, email: 'test@test.com' };
      mockDb.get.mockResolvedValue(fakeUser);

      const result = await repo.findByEmail('test@test.com');

      expect(getDb).toHaveBeenCalled();
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = ?'),
        ['test@test.com']
      );
      expect(result).toEqual(fakeUser);
    });

    it('should return null if no user is found', async () => {
      mockDb.get.mockResolvedValue(null);

      const result = await repo.findByEmail('missing@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const fakeUser = { id: 2, email: 'me@test.com' };
      mockDb.get.mockResolvedValue(fakeUser);

      const result = await repo.findById(2);

      expect(getDb).toHaveBeenCalled();
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [2]
      );
      expect(result).toEqual(fakeUser);
    });

    it('should return null if no user is found', async () => {
      mockDb.get.mockResolvedValue(null);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should insert a new user and return the created record', async () => {
      const newUser = { id: 3, email: 'new@test.com' };
      mockDb.run.mockResolvedValue({ lastID: 3 });
      mockDb.get.mockResolvedValue(newUser); // findById result

      const result = await repo.createUser({
        email: 'new@test.com',
        passwordHash: 'hashed',
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['new@test.com', 'hashed']
      );
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [3]
      );
      expect(result).toEqual(newUser);
    });

    it('should throw if db.run fails (duplicate email)', async () => {
      mockDb.run.mockRejectedValue(new Error('SQLITE_CONSTRAINT: UNIQUE failed'));

      await expect(
        repo.createUser({ email: 'dup@test.com', passwordHash: 'hash' })
      ).rejects.toThrow('SQLITE_CONSTRAINT: UNIQUE failed');
    });
  });
});
