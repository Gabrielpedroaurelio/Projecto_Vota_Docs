/**
 * Rotas de Enquetes - VotaAki
 * 
 * Gere o acesso público e administrativo às enquetes do sistema.
 */

import express from 'express';
import * as pollController from '../controllers/pollController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/polls
 * @desc  Lista todas as enquetes (Acesso Público).
 */
router.get('/', pollController.getPolls);

/**
 * @route GET /api/polls/stats
 * @desc  Obtém estatísticas das enquetes (Acesso Admin).
 */
router.get('/stats', authMiddleware, roleMiddleware('admin'), pollController.getPollStats);

/**
 * @route GET /api/polls/:id
 * @desc  Obtém os detalhes completos de uma enquete (Acesso Público).
 */
router.get('/:id', pollController.getPollById);

/**
 * @route PUT /api/polls/:id
 * @desc  Atualiza uma enquete existente (Acesso Admin).
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), pollController.updatePoll);

/**
 * @route DELETE /api/polls/:id
 * @desc  Exclui uma enquete existente (Acesso Admin).
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), pollController.deletePoll);

/**
 * @route POST /api/polls
 * @desc  Cria uma nova enquete (Acesso Protegido: Admin).
 */
router.post('/', authMiddleware, roleMiddleware('admin'), pollController.createPoll);

export default router;
