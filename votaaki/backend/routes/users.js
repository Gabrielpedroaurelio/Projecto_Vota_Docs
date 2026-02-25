
import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication (Admin)
router.use(authenticateToken);

/**
 * @route GET /api/users
 * @desc  List all users with pagination and filters
 */
router.get('/', userController.getUsers);

/**
 * @route GET /api/users/stats
 * @desc  Get user management statistics
 */
router.get('/stats', userController.getUserStats);

/**
 * @route GET /api/users/:id
 * @desc  Get specific user profile and stats
 */
router.get('/:id', userController.getUserById);

/**
 * @route POST /api/users
 * @desc  Create a new user manually
 */
router.post('/', userController.createUser);

/**
 * @route PUT /api/users/:id
 * @desc  Update user general information
 */
router.put('/:id', userController.updateUser);

/**
 * @route PATCH /api/users/:id/password
 * @desc  Update a user password
 */
router.patch('/:id/password', userController.updateUserPassword);

/**
 * @route DELETE /api/users/:id
 * @desc  Permanently delete a user
 */
router.delete('/:id', userController.deleteUser);

export default router;
