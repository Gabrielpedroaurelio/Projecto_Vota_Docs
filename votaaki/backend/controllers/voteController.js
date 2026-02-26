/**
 * Vote Controller - VotaAki
 * 
 * Manages the vote submission process and statistical results visualization.
 */

import db from '../db/config.js';
import { logActivity } from '../utils/logHelper.js';

/**
 * Register a Vote
 */
export const vote = async (req, res) => {
  const { id_poll, id_option } = req.body;
  const id_user = req.user.id; // Identified via JWT metadata

  try {
    // 1. Get the bridge ID (id_poll_option) for this poll and option
    const [bridge] = await db.execute(
      'SELECT id_poll_option FROM Poll_VoteOption WHERE id_poll = ? AND id_option = ?',
      [id_poll, id_option]
    );

    if (bridge.length === 0) {
      return res.status(404).json({ message: 'The selected option does not belong to this poll.' });
    }

    const id_poll_option = bridge[0].id_poll_option;

    // 2. Check if the user has already voted in this poll
    // We check if a vote exists for this user and ANY option of this poll
    const [existingVote] = await db.execute(
      `SELECT v.id_vote FROM Vote v 
       JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option 
       WHERE v.id_user = ? AND pvo.id_poll = ?`,
      [id_user, id_poll]
    );

    if (existingVote.length > 0) {
      return res.status(400).json({ message: 'You have already registered your vote in this poll. Thank you for participating.' });
    }

    // 3. Insert the vote
    // Note: Database Trigger (trg_block_vote_closed_poll) prevents votes in closed polls.
    const [result] = await db.execute(
      'INSERT INTO Vote (id_user, id_poll_option) VALUES (?, ?)',
      [id_user, id_poll_option]
    );

    // 4. Log the activity (Optional: voting is high frequency, but required by user for "all resources")
    await logActivity(id_user, 'Vote', result.insertId, 'Insert', null, { id_poll_option });

    res.status(201).json({ message: 'Vote recorded successfully!' });
  } catch (error) {
    console.error('Error Voting:', error);
    
    // Handling errors from SQL Triggers or Constraints (State 45000)
    if (error.sqlState === '45000') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Could not register your vote.' });
  }
};

/**
 * Get Poll Results
 */
export const getResults = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch consolidated results from the English View
    const [results] = await db.execute(
      'SELECT designation, id_option, total_votes FROM vw_poll_results WHERE id_poll = ?',
      [id]
    );

    // Get the total vote count via the English SQL Function
    const [totalResult] = await db.execute(
      'SELECT fn_poll_total_votes(?) as total',
      [id]
    );

    res.json({
      results,
      total: totalResult[0].total
    });
  } catch (error) {
    console.error('Error Fetching Results:', error);
    res.status(500).json({ message: 'Error processing poll statistics.' });
  }
};
