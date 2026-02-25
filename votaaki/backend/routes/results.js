
import express from 'express';
import * as resultController from '../controllers/resultController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/results/dashboard
 * @desc  Get global system KPIs (Admin Only)
 */
router.get('/dashboard', authenticateToken, resultController.getDashboardStats);

/**
 * @route GET /api/results/engagement
 * @desc  Get deep engagement metrics (Admin Only)
 */
router.get('/engagement', authenticateToken, resultController.getEngagementMetrics);

/**
 * @route GET /api/results/poll/:id
 * @desc  Get detailed vote results for a poll
 */
router.get('/poll/:id', resultController.getPollResults);

/**
 * @route GET /api/results/report
 * @desc  Generate a voting activity report
 */
router.get('/report', authenticateToken, resultController.getVotingReport);

/**
 * @route GET /api/results/user/:id
 * @desc  Get participation history for a user
 */
router.get('/user/:id', authenticateToken, resultController.getUserParticipationStats);

export default router;
