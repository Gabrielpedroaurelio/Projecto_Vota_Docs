/**
 * Controller de Autenticação - VotaAki
 * 
 * Gere o registo e o login de utilizadores, incluindo encriptação de passwords
 * com bcrypt e geração de tokens JWT.
 */

import db from '../db/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Registo de Novo Utilizador
 * 
 * Cria uma nova conta de utilizador com password encriptada.
 */
export const register = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Verifica se já existe um utilizador com o email fornecido
    const [existingUser] = await db.execute('SELECT * FROM Usuario WHERE email_usuario = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Lamentamos, mas este email já está registado.' });
    }

    // Gera o salt e encripta a password para armazenamento seguro
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // Insere o utilizador na base de dados
    const [result] = await db.execute(
      'INSERT INTO Usuario (nome_usuario, email_usuario, senha_usuario) VALUES (?, ?, ?)',
      [nome, email, hashedPassword]
    );

    res.status(201).json({ message: 'Conta criada com sucesso!', userId: result.insertId });
  } catch (error) {
    console.error('Erro no Registo:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar registar o utilizador.' });
  }
};

/**
 * Login de Utilizador
 * 
 * Valida credenciais e devolve um Token JWT para autenticação.
 */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Procura o utilizador pelo email
    const [users] = await db.execute('SELECT * FROM Usuario WHERE email_usuario = ?', [email]);
    const user = users[0];

    // Verifica se o utilizador existe
    if (!user) {
      return res.status(400).json({ message: 'Email ou password incorretos.' });
    }

    // Compara a password fornecida com a hash guardada
    const isMatch = await bcrypt.compare(senha, user.senha_usuario);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou password incorretos.' });
    }

    // Verifica se a conta está ativa
    if (user.status !== 'ativo') {
      return res.status(403).json({ message: `A sua conta encontra-se atualmente ${user.status}.` });
    }

    // Atualiza o registo do último login
    await db.execute('UPDATE Usuario SET ultimo_login = NOW() WHERE id_usuario = ?', [user.id_usuario]);

    // Gera o Token JWT contendo o ID e o Cargo (tipo) do utilizador
    const token = jwt.sign(
      { id: user.id_usuario, tipo: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Devolve os dados essenciais para o Frontend
    res.json({
      token,
      user: {
        id: user.id_usuario,
        nome: user.nome_usuario,
        email: user.email_usuario,
        tipo: user.tipo_usuario,
        imagem: user.caminho_imagem
      }
    });
  } catch (error) {
    console.error('Erro no Login:', error);
    res.status(500).json({ message: 'Erro interno ao processar o login.' });
  }
};
