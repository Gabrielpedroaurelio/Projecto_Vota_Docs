import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc  Registers a new user.
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc  Authenticates a user and returns JWT.
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/logout
 * @desc  Logs out a user and closes session log.
 */
router.post('/logout', authenticateToken, authController.logout);

export default router;
