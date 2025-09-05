/**
 * @file auth.controller.test.js
 * Unit tests for AuthController class
 */

import AuthController from '../controllers/auth.controller.js';
import AuthUsecase from '../usecases/auth.usecase.js';

jest.mock('../usecases/auth.usecase.js'); // Mock AuthUsecase

describe('AuthController', () => {
  let controller;
  let mockUsecase;
  let req;
  let res;
  let next;

  beforeEach(() => {
    mockUsecase = {
      register: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
    };
    AuthUsecase.mockImplementation(() => mockUsecase);

    controller = new AuthController();

    req = {
      body: {},
      session: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should register a new user and set session', async () => {
      const fakeUser = { id: 1, email: 'test@test.com' };
      req.body = { email: 'test@test.com', password: 'secret' };
      mockUsecase.register.mockResolvedValue(fakeUser);

      await controller.register(req, res, next);

      expect(mockUsecase.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'secret',
      });
      expect(req.session.userId).toBe(fakeUser.id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Registered successfully',
        user: fakeUser,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Email already exists');
      mockUsecase.register.mockRejectedValue(error);

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should log in a user and set session', async () => {
      const fakeUser = { id: 2, email: 'me@test.com' };
      req.body = { email: 'me@test.com', password: 'pass123' };
      mockUsecase.login.mockResolvedValue(fakeUser);

      await controller.login(req, res, next);

      expect(mockUsecase.login).toHaveBeenCalledWith({
        email: 'me@test.com',
        password: 'pass123',
      });
      expect(req.session.userId).toBe(fakeUser.id);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged in',
        user: fakeUser,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Invalid credentials');
      mockUsecase.login.mockRejectedValue(error);

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      const fakeUser = { id: 3, email: 'me@test.com' };
      req.session.userId = 3;
      mockUsecase.getProfile.mockResolvedValue(fakeUser);

      await controller.me(req, res, next);

      expect(mockUsecase.getProfile).toHaveBeenCalledWith(3);
      expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
    });

    it('should throw 401 if not authenticated', async () => {
      req.session.userId = null;

      await controller.me(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('logout', () => {
    it('should destroy session and clear cookie', async () => {
      req.session.destroy = jest.fn((cb) => cb(null));

      await controller.logout(req, res, next);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
    });

    it('should handle destroy session error', async () => {
      req.session.destroy = jest.fn((cb) => cb(new Error('Destroy failed')));

      await controller.logout(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle missing session gracefully', async () => {
      req.session = null;

      await controller.logout(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
    });
  });
});
