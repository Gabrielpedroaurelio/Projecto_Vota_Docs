
import express from 'express';
import * as voteController from '../controllers/voteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/votes
 * @desc  Submit a vote. Requires authenticated user.
 */
router.post('/', authenticateToken, voteController.vote);

/**
 * @route GET /api/votes/results/:id
 * @desc  Get simple vote count for a poll
 */
router.get('/results/:id', voteController.getResults);

export default router;
