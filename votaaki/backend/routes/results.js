/**
 * Rotas de Resultados e Estatísticas - VotaAki
 * 
 * Rotas para dashboard, relatórios e métricas do sistema.
 */

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getDashboardStats,
  getPollResults,
  getVotingReport,
  getUserParticipationStats,
  getPollRanking,
  getEngagementMetrics
} from '../controllers/resultController.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Estatísticas do dashboard (Admin only)
router.get('/dashboard', roleMiddleware('admin'), getDashboardStats);

// Resultados de uma enquete específica
router.get('/poll/:id', getPollResults);

// Relatório de votação por período (Admin only)
router.get('/voting-report', roleMiddleware('admin'), getVotingReport);

// Estatísticas de participação do usuário (Admin ou próprio usuário)
router.get('/user/:id', getUserParticipationStats);

// Ranking de enquetes (público)
router.get('/poll-ranking', getPollRanking);

// Métricas de engajamento (Admin only)
router.get('/engagement', roleMiddleware('admin'), getEngagementMetrics);

export default router;
