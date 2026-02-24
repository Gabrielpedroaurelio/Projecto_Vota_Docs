/**
 * Rotas de Votação - VotaAki
 * 
 * Define os endpoints para submissão de votos e consulta de estatísticas.
 */

import express from 'express';
import * as voteController from '../controllers/voteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/votes
 * @desc  Regista o voto do utilizador (Acesso Protegido: Utilizador Autenticado).
 */
router.post('/', authMiddleware, voteController.vote);

/**
 * @route GET /api/votes/results/:id
 * @desc  Obtém as estatísticas de votação em tempo real.
 */
router.get('/results/:id', voteController.getResults);

export default router;
