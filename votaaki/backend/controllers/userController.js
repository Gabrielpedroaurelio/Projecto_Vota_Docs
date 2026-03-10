/**
 * User Controller - VotaAki
 * 
 * Responsible for complete User CRUD and administrative management.
 * Utilizes views and functions for optimized performance.
 */

import db from '../db/config.js';
import bcrypt from 'bcryptjs';
import { logActivity } from '../utils/logHelper.js';

/**
 * List all users (Admin Access)
 */
export const getUsers = async (req, res) => {
  try {
    const { search = '', status = 'all' } = req.query;

    let query = `
      SELECT 
        id_user,
        name,
        email,
        user_type,
        status,
        last_login,
        created_at,
        updated_at
      FROM User
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const [users] = await db.execute(query, params);
    return res.json(users);

  } catch (error) {
    console.error('Error listing users:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Get user by ID (Admin Access)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await db.execute(
      `SELECT 
        id_user,
        name,
        email,
        user_type,
        status,
        path_thumb,
        last_login,
        created_at,
        updated_at
      FROM User 
      WHERE id_user = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    // User statistics (polls created)
    const [stats] = await db.execute(
      `SELECT 
        COUNT(id_poll) as total_polls_created,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_polls
      FROM Poll
      WHERE id_user = ?`,
      [id]
    );

    const user = {
      ...users[0],
      stats: stats[0]
    };

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Create new user (Admin Access)
 */
export const createUser = async (req, res) => {
  const adminId = req.user.id;
  try {
    const { 
      name, 
      email, 
      password, 
      user_type = 'user',
      status = 'active'
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nome, e-mail e palavra-passe são obrigatórios' 
      });
    }

    // Check if email already exists
    const [existingUser] = await db.execute(
      'SELECT id_user FROM User WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'E-mail já registado' 
      });
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await db.execute(
      `INSERT INTO User 
        (name, email, password_hash, user_type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password_hash, user_type, status]
    );

    // Activity Log
    await logActivity(adminId, 'Utilizador', result.insertId, 'Inseriu', null, { name, email, user_type, status });

    res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: {
        id: result.insertId,
        name,
        email,
        type: user_type,
        status
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Update user (Admin Access)
 */
export const updateUser = async (req, res) => {
  const adminId = req.user.id;
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      user_type, 
      status,
      path_thumb 
    } = req.body;

    const [oldData] = await db.execute(
      'SELECT * FROM User WHERE id_user = ?',
      [id]
    );

    if (oldData.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    // Check email uniqueness
    if (email) {
      const [emailCheck] = await db.execute(
        'SELECT id_user FROM User WHERE email = ? AND id_user != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          message: 'O e-mail já está a ser utilizado por outro utilizador' 
        });
      }
    }

    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (user_type && ['admin', 'user'].includes(user_type)) {
      updateFields.push('user_type = ?');
      updateValues.push(user_type);
    }
    if (status && ['active', 'inactive', 'banned'].includes(status)) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (path_thumb !== undefined) {
      updateFields.push('path_thumb = ?');
      updateValues.push(path_thumb);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(id);

    const [result] = await db.execute(
      `UPDATE User SET ${updateFields.join(', ')} WHERE id_user = ?`,
      updateValues
    );

    // Activity Log
    await logActivity(adminId, 'Utilizador', id, 'Actualizou', oldData[0], req.body);

    res.json({ message: 'Utilizador atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Update user password (Admin Access)
 */
export const updateUserPassword = async (req, res) => {
  const adminId = req.user.id;
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'A palavra-passe é obrigatória' });
    }

    const [existing] = await db.execute('SELECT id_user FROM User WHERE id_user = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    await db.execute('UPDATE User SET password_hash = ? WHERE id_user = ?', [password_hash, id]);

    // Activity Log
    await logActivity(adminId, 'Utilizador', id, 'Actualizou', { password: 'HIDDEN' }, { password: 'CHANGED' });

    res.json({ message: 'Palavra-passe atualizada com sucesso' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Delete user (Admin Access)
 */
export const deleteUser = async (req, res) => {
  const adminId = req.user.id;
  try {
    const { id } = req.params;

    const [oldData] = await db.execute('SELECT * FROM User WHERE id_user = ?', [id]);
    if (oldData.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    // Protect last active admin
    const [adminCount] = await db.execute(
      "SELECT COUNT(*) as count FROM User WHERE user_type = 'admin' AND status = 'active'"
    );

    if (adminCount[0].count <= 1 && oldData[0].user_type === 'admin') {
      return res.status(400).json({ message: 'Não é possível eliminar o último administrador ativo' });
    }

    await db.execute('DELETE FROM User WHERE id_user = ?', [id]);

    // Activity Log
    await logActivity(adminId, 'Utilizador', id, 'Apagou', oldData[0], null);

    res.json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Get user stats (Dashboard)
 */
export const getUserStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN user_type = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN user_type = 'user' THEN 1 ELSE 0 END) as total_regular_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as banned_users,
        SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_last_week,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_30_days
      FROM User
    `);

    const [topUsers] = await db.execute(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        COUNT(p.id_poll) as total_polls,
        u.last_login
      FROM User u
      LEFT JOIN Poll p ON u.id_user = p.id_user
      WHERE u.status = 'active'
      GROUP BY u.id_user
      ORDER BY total_polls DESC, u.last_login DESC
      LIMIT 5
    `);

    res.json({
      stats: stats[0],
      topUsers
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Get logged-in user profile
 */
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await db.execute(
      'SELECT id_user, name, email, user_type, status, path_thumb, created_at FROM User WHERE id_user = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Update logged-in user profile
 */
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    let path_thumb = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

    // Get current user data
    const [users] = await db.execute('SELECT * FROM User WHERE id_user = ?', [userId]);
    const user = users[0];

    if (!user) {
        return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email && email !== user.email) {
      const [emailCheck] = await db.execute(
        'SELECT id_user FROM User WHERE email = ? AND id_user != ?',
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: 'E-mail já em uso' });
      }
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (path_thumb) {
      updateFields.push('path_thumb = ?');
      updateValues.push(path_thumb);
    }

    // Password change logic
    if (newPassword) {
      if (!currentPassword) {
          return res.status(400).json({ message: 'A palavra-passe atual é necessária para alterar a palavra-passe' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
          return res.status(400).json({ message: 'Palavra-passe atual incorreta' });
      }
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      updateFields.push('password_hash = ?');
      updateValues.push(password_hash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    updateValues.push(userId);
    await db.execute(
      `UPDATE User SET ${updateFields.join(', ')} WHERE id_user = ?`,
      updateValues
    );

    res.json({ 
        message: 'Perfil atualizado com sucesso',
        image: path_thumb // Return new image path to update frontend state
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
/**
 * Get all login logs (Admin Access)
 */
export const getLoginLogs = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    let query = `
      SELECT ll.*, u.name as user_name, u.email as user_email 
      FROM LoginLog ll 
      JOIN User u ON ll.id_user = u.id_user 
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND ll.id_user = ?';
      params.push(userId);
    }
    if (startDate) {
      query += ' AND ll.login_time >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND ll.login_time <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY ll.login_time DESC LIMIT 500';

    const [logs] = await db.execute(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Get all activity logs (Admin Access)
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { userId, tableName, action, startDate, endDate } = req.query;
    let query = `
      SELECT al.*, u.name as user_name 
      FROM ActivityLog al 
      JOIN User u ON al.id_user = u.id_user 
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND al.id_user = ?';
      params.push(userId);
    }
    if (tableName) {
      query += ' AND al.table_name = ?';
      params.push(tableName);
    }
    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }
    if (startDate) {
      query += ' AND al.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY al.created_at DESC LIMIT 500';

    const [logs] = await db.execute(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
