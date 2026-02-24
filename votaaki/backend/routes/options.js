/**
 * Rotas de Opções de Voto - VotaAki
 * 
 * Define os endpoints para gestão individual das opções de voto.
 */

import express from 'express';
import * as optionController from '../controllers/optionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/options
 * @desc  Lista todas as opções de voto de todas as enquetes.
 */
router.get('/', authMiddleware, optionController.getOptions);

/**
 * @route GET /api/options/poll/:id
 * @desc  Lista todas as opções de uma enquete específica.
 */
router.get('/poll/:id', authMiddleware, optionController.getOptionsByPoll);

/**
 * @route POST /api/options
 * @desc  Cria uma nova opção de voto (Acesso Admin).
 */
router.post('/', authMiddleware, roleMiddleware('admin'), optionController.createOption);

/**
 * @route PUT /api/options/:id
 * @desc  Atualiza uma opção de voto existente (Acesso Admin).
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), optionController.updateOption);

/**
 * @route DELETE /api/options/:id
 * @desc  Exclui uma opção de voto (Acesso Admin).
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), optionController.deleteOption);

export default router;
