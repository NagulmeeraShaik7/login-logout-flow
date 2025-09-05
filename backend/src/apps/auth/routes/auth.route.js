import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import requireAuth from '../../../middlewares/auth.middleware.js';

const router = Router();
const controller = new AuthController();

// Public
router.post('/register', controller.register);
router.post('/login', controller.login);

// Protected
router.get('/me', requireAuth, controller.me);
router.post('/logout', requireAuth, controller.logout);

export default router;
