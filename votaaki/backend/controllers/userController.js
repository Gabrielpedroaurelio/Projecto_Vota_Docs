/**
 * Controller de Usuários - VotaAki
 * 
 * Responsável pelo CRUD completo de usuários e gestão administrativa.
 * Utiliza views e functions do banco para performance otimizada.
 */

import db from '../db/config.js';
import bcrypt from 'bcryptjs';

/**
 * Listar todos os usuários (Acesso Admin)
 */
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id_usuario,
        nome_usuario,
        email_usuario,
        tipo_usuario,
        status,
        ultimo_login,
        criado_em,
        actualizado_em
      FROM Usuario
      WHERE 1=1
    `;
    const params = [];

    // Filtro por busca
    if (search) {
      query += ` AND (nome_usuario LIKE ? OR email_usuario LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filtro por status
    if (status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY criado_em DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await db.execute(query, params);

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Usuario 
      WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (nome_usuario LIKE ? OR email_usuario LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter usuário por ID (Acesso Admin)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await db.execute(
      `SELECT 
        id_usuario,
        nome_usuario,
        email_usuario,
        tipo_usuario,
        status,
        caminho_imagem,
        ultimo_login,
        criado_em,
        actualizado_em
      FROM Usuario 
      WHERE id_usuario = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Estatísticas do usuário usando view
    const [stats] = await db.execute(
      `SELECT 
        COUNT(e.id_enquete) as total_enquetes_criadas,
        SUM(CASE WHEN e.status = 'ativa' THEN 1 ELSE 0 END) as enquetes_ativas
      FROM vw_enquetes_usuario 
      WHERE id_usuario = ?`,
      [id]
    );

    const user = {
      ...users[0],
      stats: stats[0]
    };

    res.json(user);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Criar novo usuário (Acesso Admin)
 */
export const createUser = async (req, res) => {
  try {
    const { 
      nome_usuario, 
      email_usuario, 
      senha_usuario, 
      tipo_usuario = 'usuario',
      status = 'ativo'
    } = req.body;

    // Validações
    if (!nome_usuario || !email_usuario || !senha_usuario) {
      return res.status(400).json({ 
        message: 'Nome, email e senha são obrigatórios' 
      });
    }

    if (!['admin', 'usuario'].includes(tipo_usuario)) {
      return res.status(400).json({ 
        message: 'Tipo de usuário inválido' 
      });
    }

    // Verificar se email já existe
    const [existingUser] = await db.execute(
      'SELECT id_usuario FROM Usuario WHERE email_usuario = ?',
      [email_usuario]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'Email já cadastrado' 
      });
    }

    // Encriptar senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(senha_usuario, saltRounds);

    // Inserir usuário
    const [result] = await db.execute(
      `INSERT INTO Usuario 
        (nome_usuario, email_usuario, senha_usuario, tipo_usuario, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [nome_usuario, email_usuario, hashedPassword, tipo_usuario, status]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id_usuario: result.insertId,
        nome_usuario,
        email_usuario,
        tipo_usuario,
        status
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar usuário (Acesso Admin)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome_usuario, 
      email_usuario, 
      tipo_usuario, 
      status,
      caminho_imagem 
    } = req.body;

    // Verificar se usuário existe
    const [existingUser] = await db.execute(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se email já existe para outro usuário
    if (email_usuario) {
      const [emailCheck] = await db.execute(
        'SELECT id_usuario FROM Usuario WHERE email_usuario = ? AND id_usuario != ?',
        [email_usuario, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          message: 'Email já está em uso por outro usuário' 
        });
      }
    }

    // Construir query dinâmica
    let updateFields = [];
    let updateValues = [];

    if (nome_usuario) {
      updateFields.push('nome_usuario = ?');
      updateValues.push(nome_usuario);
    }

    if (email_usuario) {
      updateFields.push('email_usuario = ?');
      updateValues.push(email_usuario);
    }

    if (tipo_usuario && ['admin', 'usuario'].includes(tipo_usuario)) {
      updateFields.push('tipo_usuario = ?');
      updateValues.push(tipo_usuario);
    }

    if (status && ['ativo', 'inativo', 'banido'].includes(status)) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (caminho_imagem !== undefined) {
      updateFields.push('caminho_imagem = ?');
      updateValues.push(caminho_imagem);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhum campo válido para atualizar' 
      });
    }

    updateValues.push(id);

    const [result] = await db.execute(
      `UPDATE Usuario SET ${updateFields.join(', ')} WHERE id_usuario = ?`,
      updateValues
    );

    res.json({
      message: 'Usuário atualizado com sucesso',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar senha do usuário (Acesso Admin)
 */
export const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha_usuario } = req.body;

    if (!senha_usuario) {
      return res.status(400).json({ 
        message: 'Senha é obrigatória' 
      });
    }

    // Verificar se usuário existe
    const [existingUser] = await db.execute(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Encriptar nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(senha_usuario, saltRounds);

    const [result] = await db.execute(
      'UPDATE Usuario SET senha_usuario = ? WHERE id_usuario = ?',
      [hashedPassword, id]
    );

    res.json({
      message: 'Senha atualizada com sucesso',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Excluir usuário (Acesso Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const [existingUser] = await db.execute(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se não é o último admin
    const [adminCount] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM Usuario 
       WHERE tipo_usuario = 'admin' AND status = 'ativo'`
    );

    if (adminCount[0].count <= 1 && existingUser[0].tipo_usuario === 'admin') {
      return res.status(400).json({ 
        message: 'Não é possível excluir o último administrador ativo' 
      });
    }

    const [result] = await db.execute(
      'DELETE FROM Usuario WHERE id_usuario = ?',
      [id]
    );

    res.json({
      message: 'Usuário excluído com sucesso',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter estatísticas dos usuários (Dashboard)
 */
export const getUserStats = async (req, res) => {
  try {
    // Estatísticas gerais usando queries otimizadas
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN tipo_usuario = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN tipo_usuario = 'usuario' THEN 1 ELSE 0 END) as total_usuarios_normais,
        SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as usuarios_ativos,
        SUM(CASE WHEN status = 'inativo' THEN 1 ELSE 0 END) as usuarios_inativos,
        SUM(CASE WHEN status = 'banido' THEN 1 ELSE 0 END) as usuarios_banidos,
        SUM(CASE WHEN ultimo_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as usuarios_ultima_semana,
        SUM(CASE WHEN ultimo_login >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as usuarios_ultima_24h,
        SUM(CASE WHEN criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as novos_30_dias
      FROM Usuario
    `);

    // Usuários mais ativos (com mais enquetes)
    const [topUsers] = await db.execute(`
      SELECT 
        u.id_usuario,
        u.nome_usuario,
        u.email_usuario,
        COUNT(e.id_enquete) as total_enquetes,
        MAX(u.ultimo_login) as ultimo_login
      FROM Usuario u
      LEFT JOIN Enquete e ON u.id_usuario = e.id_usuario
      WHERE u.status = 'ativo'
      GROUP BY u.id_usuario
      ORDER BY total_enquetes DESC, u.ultimo_login DESC
      LIMIT 5
    `);

    res.json({
      stats: stats[0],
      topUsers
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
