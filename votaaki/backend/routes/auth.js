/**
 * Rotas de Autenticação - VotaAki
 * 
 * Define os endpoints para o registo de novos utilizadores e login.
 */

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc  Regista um novo utilizador no sistema.
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc  Autentica um utilizador e devolve o Token JWT.
 */
router.post('/login', authController.login);

export default router;
