/**
 * Poll Controller - VotaAki (Optimized Version)
 * 
 * Responsible for creating, listing, and detailed viewing of polls,
 * using batch operations/transactions and optimized database functions.
 */

import db from '../db/config.js';
import { logActivity } from '../utils/logHelper.js';

/**
 * Create a New Poll (Admin Only) - Optimized
 */
export const createPoll = async (req, res) => {
  const { title, description, start_date, end_date, options } = req.body;
  const id_user = req.user.id;

  if (!options || options.length < 2) {
    return res.status(400).json({ message: 'A poll must have at least two vote options.' });
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

    // 2. Insert options and link them (Optimized batch insert)
    // Note: In refined schema, we insert into VoteOption first, then Poll_VoteOption.
    // Batching VoteOption inserts:
    const optionIds = [];
    for (const opt of options) {
      const [optResult] = await connection.execute(
        'INSERT INTO VoteOption (designation, description) VALUES (?, ?)',
        [opt.designation, opt.description || '']
      );
      optionIds.push(optResult.insertId);
    }

    // Batch link bridge table
    const bridgeValues = optionIds.map(id => [id_poll, id]);
    await connection.query(
      'INSERT INTO Poll_VoteOption (id_poll, id_option) VALUES ?',
      [bridgeValues]
    );

    // 3. Log Activity
    await logActivity(id_user, 'Poll', id_poll, 'Insert', null, { title, options_count: options.length });

    await connection.commit();

    // Fetch complete poll with options and vote counts
    const [pollData] = await connection.execute(`
      SELECT 
        p.*,
        u.name as creator,
        fn_poll_total_votes(p.id_poll) as total_votes
      FROM Poll p
      JOIN User u ON p.id_user = u.id_user
      WHERE p.id_poll = ?
    `, [id_poll]);

    const [pollOptions] = await connection.execute(`
      SELECT 
        vo.id_option,
        vo.designation,
        vo.description,
        fn_option_total_votes(?, vo.id_option) as total_votes
      FROM VoteOption vo
      JOIN Poll_VoteOption pvo ON vo.id_option = pvo.id_option
      WHERE pvo.id_poll = ?
      ORDER BY vo.id_option
    `, [id_poll, id_poll]);

    res.status(201).json({
      message: 'Poll created successfully',
      poll: {
        ...pollData[0],
        options: pollOptions
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Optimized Create Poll Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

/**
 * List all Polls (Public) - Optimized
 */
export const getPollsOptimized = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      sort_by = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    const validSortFields = ['created_at', 'end_date', 'title', 'total_votes'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [polls] = await db.execute(`
      SELECT 
        p.id_poll,
        p.title,
        p.description,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at,
        u.name as creator,
        u.email as creator_email,
        fn_poll_total_votes(p.id_poll) as total_votes,
        CASE 
          WHEN p.end_date IS NULL THEN NULL
          WHEN p.end_date < NOW() THEN 'closed'
          ELSE 'active'
        END as current_status
      FROM Poll p
      JOIN User u ON p.id_user = u.id_user
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM Poll p 
      ${whereClause}
    `, params);

    const total = countResult[0].total;

    res.json({
      polls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error listing optimized polls:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get Poll by ID (Public) - Optimized
 */
export const getPollByIdOptimized = async (req, res) => {
  try {
    const { id } = req.params;

    const [polls] = await db.execute(`
      SELECT 
        p.*,
        u.name as creator,
        u.email as creator_email,
        fn_poll_total_votes(p.id_poll) as total_votes,
        CASE 
          WHEN p.end_date IS NULL THEN NULL
          WHEN p.end_date < NOW() THEN 'closed'
          ELSE 'active'
        END as current_status
      FROM Poll p
      JOIN User u ON p.id_user = u.id_user
      WHERE p.id_poll = ?
    `, [id]);

    if (polls.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const poll = polls[0];

    // Fetch options with vote counts
    const [options] = await db.execute(`
      SELECT 
        vo.id_option,
        vo.designation,
        vo.description,
        pvo.id_poll_option,
        fn_option_total_votes(?, vo.id_option) as total_votes
      FROM VoteOption vo
      JOIN Poll_VoteOption pvo ON vo.id_option = pvo.id_option
      WHERE pvo.id_poll = ?
      ORDER BY vo.id_option
    `, [id, id]);

    // Check if user has already voted
    let user_voted = false;
    if (req.user) {
      const [voteCheck] = await db.execute(`
        SELECT COUNT(*) as count
        FROM Vote v
        JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
        WHERE v.id_user = ? AND pvo.id_poll = ?
      `, [req.user.id, id]);

      user_voted = voteCheck[0].count > 0;
    }

    res.json({
      ...poll,
      options,
      user_voted
    });

  } catch (error) {
    console.error('Error getting optimized poll:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
