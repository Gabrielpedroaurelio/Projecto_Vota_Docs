
import express from 'express';
import * as optionController from '../controllers/optionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/options
 * @desc  List all vote options (Admin Only)
 */
router.get('/', authenticateToken, optionController.getOptions);

/**
 * @route GET /api/options/poll/:id
 * @desc  Get all options linked to a specific poll
 */
router.get('/poll/:id', optionController.getOptionsByPoll);

/**
 * @route POST /api/options
 * @desc  Create a new vote option and link it to a poll
 */
router.post('/', authenticateToken, optionController.createOption);

/**
 * @route PUT /api/options/:id
 * @desc  Update a vote option
 */
router.put('/:id', authenticateToken, optionController.updateOption);

/**
 * @route DELETE /api/options/:id
 * @desc  Delete a vote option
 */
router.delete('/:id', authenticateToken, optionController.deleteOption);

export default router;
