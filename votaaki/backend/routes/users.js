/**
 * Rotas de Usuários - VotaAki
 * 
 * Todas as rotas requerem autenticação e privilégios de administrador.
 */

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Listar todos os usuários (Admin only)
router.get('/', roleMiddleware('admin'), getUsers);

// Obter estatísticas dos usuários (Admin only)
router.get('/stats', roleMiddleware('admin'), getUserStats);

// Obter usuário por ID (Admin only)
router.get('/:id', roleMiddleware('admin'), getUserById);

// Criar novo usuário (Admin only)
router.post('/', roleMiddleware('admin'), createUser);

// Atualizar usuário (Admin only)
router.put('/:id', roleMiddleware('admin'), updateUser);

// Atualizar senha do usuário (Admin only)
router.put('/:id/password', roleMiddleware('admin'), updateUserPassword);

// Excluir usuário (Admin only)
router.delete('/:id', roleMiddleware('admin'), deleteUser);

export default router;
