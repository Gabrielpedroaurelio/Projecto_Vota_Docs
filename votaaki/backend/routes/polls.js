
import express from 'express';
import * as pollController from '../controllers/pollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/polls/stats
 * @desc  Get general poll statistics (Admin Only)
 */
router.get('/stats', authenticateToken, pollController.getPollStats);

/**
 * @route GET /api/polls
 * @desc  List all polls (Public)
 */
router.get('/', pollController.getPolls);

/**
 * @route GET /api/polls/:id
 * @desc  Get detailed poll information
 */
router.get('/:id', pollController.getPollById);

/**
 * @route POST /api/polls
 * @desc  Create a new poll (Admin Only)
 */
router.post('/', authenticateToken, pollController.createPoll);

/**
 * @route PUT /api/polls/:id
 * @desc  Update a poll (Admin Only)
 */
router.put('/:id', authenticateToken, pollController.updatePoll);

/**
 * @route DELETE /api/polls/:id
 * @desc  Delete a poll (Admin Only)
 */
router.delete('/:id', authenticateToken, pollController.deletePoll);

export default router;
