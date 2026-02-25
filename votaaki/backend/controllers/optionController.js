/**
 * Vote Options Controller - VotaAki
 * 
 * Responsible for individual management of vote options associated with polls.
 */

import db from '../db/config.js';
import { logActivity } from '../utils/logHelper.js';

/**
 * List all vote options from all polls
 */
export const getOptions = async (req, res) => {
  try {
    const [options] = await db.execute(`
      SELECT vo.*, p.title as poll_title, pvo.id_poll
      FROM VoteOption vo 
      JOIN Poll_VoteOption pvo ON vo.id_option = pvo.id_option
      JOIN Poll p ON pvo.id_poll = p.id_poll
      ORDER BY vo.id_option DESC
    `);

    res.json(options);
  } catch (error) {
    console.error('Error listing all options:', error);
    res.status(500).json({ message: 'Error loading vote options.' });
  }
};

/**
 * List all options for a specific poll
 */
export const getOptionsByPoll = async (req, res) => {
  const { id } = req.params;
  try {
    const [options] = await db.execute(`
      SELECT vo.*, p.title as poll_title, pvo.id_poll
      FROM VoteOption vo 
      JOIN Poll_VoteOption pvo ON vo.id_option = pvo.id_option 
      JOIN Poll p ON pvo.id_poll = p.id_poll
      WHERE pvo.id_poll = ?
    `, [id]);

    res.json(options);
  } catch (error) {
    console.error('Error listing poll options:', error);
    res.status(500).json({ message: 'Error loading poll options.' });
  }
};

/**
 * Create a new option and link it to a poll
 */
export const createOption = async (req, res) => {
  const { designation, description, id_poll } = req.body;
  const id_user = req.user.id;

  if (!designation || !id_poll) {
    return res.status(400).json({ message: 'Designation and poll ID are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert the option
    const [optResult] = await connection.execute(
      'INSERT INTO VoteOption (designation, description) VALUES (?, ?)',
      [designation, description || '']
    );
    const id_option = optResult.insertId;

    // 2. Link to poll via bridge
    await connection.execute(
      'INSERT INTO Poll_VoteOption (id_poll, id_option) VALUES (?, ?)',
      [id_poll, id_option]
    );

    // 3. Log Activity
    await logActivity(id_user, 'VoteOption', id_option, 'Insert', null, { designation, description, id_poll });

    await connection.commit();
    res.status(201).json({ message: 'Vote option created successfully!', id_option });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating vote option:', error);
    res.status(500).json({ message: 'Error creating vote option.' });
  } finally {
    connection.release();
  }
};

/**
 * Update an existing option
 */
export const updateOption = async (req, res) => {
  const { id } = req.params;
  const { designation, description } = req.body;
  const id_user = req.user.id;

  try {
    const [oldData] = await db.execute('SELECT * FROM VoteOption WHERE id_option = ?', [id]);
    if (oldData.length === 0) {
      return res.status(404).json({ message: 'Vote option not found.' });
    }

    const [result] = await db.execute(
      'UPDATE VoteOption SET designation = ?, description = ? WHERE id_option = ?',
      [designation, description || '', id]
    );

    // Log Activity
    await logActivity(id_user, 'VoteOption', id, 'Update', oldData[0], { designation, description });

    res.json({ message: 'Vote option updated successfully!' });
  } catch (error) {
    console.error('Error updating vote option:', error);
    res.status(500).json({ message: 'Error updating vote option.' });
  }
};

/**
 * Delete a vote option
 */
export const deleteOption = async (req, res) => {
  const { id } = req.params;
  const id_user = req.user.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [oldData] = await connection.execute('SELECT * FROM VoteOption WHERE id_option = ?', [id]);
    if (oldData.length === 0) {
        return res.status(404).json({ message: 'Vote option not found.' });
    }

    // Cascade deletion should handle Poll_VoteOption and Vote, 
    // but we check ModeloFisico.sql definition. 
    // In our ModeloFisico.sql, Poll_VoteOption has ON DELETE CASCADE on id_option.
    // And Vote has ON DELETE CASCADE on id_poll_option.
    // So deleting a VoteOption should clear its bridge and votes.

    const [result] = await connection.execute(
      'DELETE FROM VoteOption WHERE id_option = ?',
      [id]
    );

    // Log Activity
    await logActivity(id_user, 'VoteOption', id, 'Delete', oldData[0], null);

    await connection.commit();
    res.json({ message: 'Vote option deleted successfully!' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting vote option:', error);
    res.status(500).json({ message: 'Error deleting vote option.' });
  } finally {
    connection.release();
  }
};
