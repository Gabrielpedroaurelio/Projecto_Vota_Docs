/**
 * Poll Controller - VotaAki
 * 
 * Responsible for creating, listing, and detailed viewing of polls,
 * using transactions to ensure consistency of vote options.
 */

import jwt from 'jsonwebtoken';
import db from '../db/config.js';
import { logActivity } from '../utils/logHelper.js';

/**
 * Get Poll Statistics (Admin Access)
 */
export const getPollStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_polls,
        COUNT(CASE WHEN p.start_date <= NOW() AND (p.end_date IS NULL OR p.end_date >= NOW()) THEN 1 END) as active_polls,
        COUNT(CASE WHEN p.start_date > NOW() THEN 1 END) as future_polls,
        COUNT(CASE WHEN p.end_date < NOW() THEN 1 END) as closed_polls,
        COUNT(CASE WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as polls_last_week,
        COUNT(CASE WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as polls_last_24h,
        COALESCE(SUM(fn_poll_total_votes(p.id_poll)), 0) as total_votes_overall
      FROM Poll p
    `);

    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Error fetching poll stats:', error);
    res.status(500).json({ message: 'Erro ao carregar estatísticas das enquetes.' });
  }
};

/**
 * Update Poll (Admin Access)
 */
export const updatePoll = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_date, end_date, status, options } = req.body;
  const id_user = req.user.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Check if poll exists
    const [oldData] = await connection.execute('SELECT * FROM Poll WHERE id_poll = ?', [id]);
    if (oldData.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Enquete não encontrada.' });
    }

    // 2. Update Main Poll
    await connection.execute(
      'UPDATE Poll SET title = ?, description = ?, start_date = ?, end_date = ?, status = ? WHERE id_poll = ?',
      [title, description, start_date, end_date, status || 'active', id]
    );

    // 3. Sync Options (if provided)
    if (options && options.length >= 2) {
      // Get current links
      const [currentLinks] = await connection.execute('SELECT id_option FROM Poll_VoteOption WHERE id_poll = ?', [id]);
      const currentOptionIds = currentLinks.map(l => l.id_option);

      const newOptionIds = [];

      for (const opt of options) {
        let optId = opt.id_option;

        if (!optId) {
          // Create new option
          const [optResult] = await connection.execute(
            'INSERT INTO VoteOption (designation, description) VALUES (?, ?)',
            [opt.designation, opt.description || '']
          );
          optId = optResult.insertId;
        }
        newOptionIds.push(optId);

        // Link if not already linked
        if (!currentOptionIds.includes(optId)) {
          await connection.execute(
            'INSERT INTO Poll_VoteOption (id_poll, id_option) VALUES (?, ?)',
            [id, optId]
          );
        }
      }

      // Unlink options that are no longer present
      const optionsToRemove = currentOptionIds.filter(id_opt => !newOptionIds.includes(id_opt));
      if (optionsToRemove.length > 0) {
        await connection.execute(
          `DELETE FROM Poll_VoteOption WHERE id_poll = ? AND id_option IN (${optionsToRemove.join(',')})`,
          [id]
        );
      }
    }

    // Log Activity
    await logActivity(id_user, 'Enquete', id, 'Actualizou', oldData[0], { title, description, start_date, end_date, status, options_count: options?.length });

    await connection.commit();
    res.json({ message: 'Enquete sincronizada com sucesso!' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating poll:', error);
    res.status(500).json({ message: 'Erro ao atualizar a enquete.' });
  } finally {
    connection.release();
  }
};


/**
 * Delete Poll (Admin Access)
 */
export const deletePoll = async (req, res) => {
  const { id } = req.params;
  const id_user = req.user.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get data for logging before delete
    const [oldData] = await connection.execute('SELECT * FROM Poll WHERE id_poll = ?', [id]);
    if (oldData.length === 0) {
      return res.status(404).json({ message: 'Enquete não encontrada.' });
    }

    // Deletion is handled by CASCADE in the database (Poll_VoteOption and Vote)
    const [result] = await connection.execute(
      'DELETE FROM Poll WHERE id_poll = ?',
      [id]
    );

    // Log Activity
    await logActivity(id_user, 'Enquete', id, 'Apagou', oldData[0], null);

    await connection.commit();
    res.json({ message: 'Enquete eliminada com sucesso!' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting poll:', error);
    res.status(500).json({ message: 'Erro ao eliminar a enquete.' });
  } finally {
    connection.release();
  }
};

/**
 * Create a New Poll (Admin Only)
 */
export const createPoll = async (req, res) => {
  const { title, description, start_date, end_date, options } = req.body;
  const id_user = req.user.id;

  if (!options || options.length < 2) {
    return res.status(400).json({ message: 'Uma enquete deve ter pelo menos duas opções de voto.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert Main Poll
    const [pollResult] = await connection.execute(
      'INSERT INTO Poll (title, description, start_date, end_date, id_user) VALUES (?, ?, ?, ?, ?)',
      [title, description, start_date || new Date(), end_date, id_user]
    );
    const id_poll = pollResult.insertId;

    // 2. Create Options (if new) and Link to Poll
    for (const opt of options) {
      let id_option = opt.id_option;

      // If id_option is not provided, it's a new option
      if (!id_option) {
        const [optResult] = await connection.execute(
          'INSERT INTO VoteOption (designation, description) VALUES (?, ?)',
          [opt.designation, opt.description || '']
        );
        id_option = optResult.insertId;
      }

      await connection.execute(
        'INSERT INTO Poll_VoteOption (id_poll, id_option) VALUES (?, ?)',
        [id_poll, id_option]
      );
    }

    // 3. Log Activity
    await logActivity(id_user, 'Enquete', id_poll, 'Inseriu', null, { title, description, start_date, end_date, options_count: options.length });

    await connection.commit();
    res.status(201).json({ message: 'Enquete publicada com sucesso!', id_poll });
  } catch (error) {
    await connection.rollback();
    console.error('Error Creating Poll:', error);
    res.status(500).json({ message: 'Falha ao processar a criação da enquete.' });
  } finally {
    connection.release();
  }
};

/**
 * List All Polls
 */
export const getPolls = async (req, res) => {
  try {
    const [polls] = await db.execute(`
      SELECT 
        p.*, 
        u.name as creator,
        (SELECT COUNT(*) FROM Vote v 
         JOIN Poll_VoteOption pvo_sum ON v.id_poll_option = pvo_sum.id_poll_option 
         WHERE pvo_sum.id_poll = p.id_poll) as total_votes
      FROM Poll p 
      JOIN User u ON p.id_user = u.id_user 
      ORDER BY p.start_date DESC
    `);
    res.json(polls);
  } catch (error) {
    console.error('Error Listing Polls:', error);
    res.status(500).json({ message: 'Não foi possível carregar as enquetes.' });
  }
};

/**
 * Get Specific Poll Details
 */
export const getPollById = async (req, res) => {
  const { id } = req.params;

  // Extraction of token for optional user identification
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  let id_user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      id_user = decoded.id;
    } catch (err) {
      // Ignore invalid tokens for this public route
    }
  }

  try {
    const [polls] = await db.execute(`
      SELECT p.*, u.name as creator, 
             (SELECT COUNT(*) FROM Vote v 
              JOIN Poll_VoteOption pvo_sum ON v.id_poll_option = pvo_sum.id_poll_option 
              WHERE pvo_sum.id_poll = p.id_poll) as total_votes
      FROM Poll p
      JOIN User u ON p.id_user = u.id_user
      WHERE id_poll = ?
    `, [id]);

    if (polls.length === 0) {
      return res.status(404).json({ message: 'Enquete não encontrada.' });
    }

    const [options] = await db.execute(`
      SELECT vo.*, pvo.id_poll_option,
             (SELECT COUNT(*) FROM Vote v WHERE v.id_poll_option = pvo.id_poll_option) as total_votes
      FROM VoteOption vo 
      JOIN Poll_VoteOption pvo ON vo.id_option = pvo.id_option 
      WHERE pvo.id_poll = ?
    `, [id]);

    let user_voted = false;
    let voted_option_id = null;

    if (id_user) {
      const [votes] = await db.execute(`
        SELECT pvo.id_option 
        FROM Vote v
        JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
        WHERE v.id_user = ? AND pvo.id_poll = ?
      `, [id_user, id]);

      if (votes.length > 0) {
        user_voted = true;
        voted_option_id = votes[0].id_option;
      }
    }

    res.json({
      ...polls[0],
      options,
      user_voted,
      voted_option_id
    });
  } catch (error) {
    console.error('Error Getting Poll:', error);
    res.status(500).json({ message: 'Erro ao carregar os detalhes da enquete.' });
  }
};
