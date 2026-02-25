/**
 * Results and Statistics Controller - VotaAki
 * 
 * Uses database views and functions for optimized performance.
 * Provides data for dashboard and administrative reports.
 */

import db from '../db/config.js';

/**
 * Get General Dashboard Statistics (Admin Access)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Core statistics using optimized queries
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM User WHERE status = 'active') as total_active_users,
        (SELECT COUNT(*) FROM User WHERE user_type = 'admin') as total_admins,
        (SELECT COUNT(*) FROM Poll) as total_polls,
        (SELECT COUNT(*) FROM Poll WHERE status = 'active') as active_polls,
        (SELECT COUNT(*) FROM Poll WHERE status = 'closed') as closed_polls,
        (SELECT COUNT(*) FROM User WHERE last_login >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as users_online,
        (SELECT COUNT(*) FROM Vote WHERE vote_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as votes_last_24h,
        (SELECT COUNT(*) FROM Vote WHERE vote_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as votes_last_week
    `);

    // Top 5 most voted polls using English view
    const [topPolls] = await db.execute(`
      SELECT 
        id_poll,
        title,
        SUM(total_votes) as total_votes
      FROM vw_poll_results 
      GROUP BY id_poll, title
      ORDER BY total_votes DESC
      LIMIT 5
    `);

    // Polls created in the last 30 days
    const [recentPolls] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM Poll 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Vote distribution by day of week
    const [votesByDay] = await db.execute(`
      SELECT 
        DAYNAME(vote_date) as week_day,
        COUNT(*) as total_votes
      FROM Vote 
      WHERE vote_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DAYNAME(vote_date)
      ORDER BY FIELD(DAYNAME(vote_date), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `);

    // Activity Logs (Last 10 actions) - NEW for impressive Dashboard
    const [recentActivity] = await db.execute(`
      SELECT l.*, u.name as user_name 
      FROM ActivityLog l
      JOIN User u ON l.id_user = u.id_user
      ORDER BY l.created_at DESC
      LIMIT 10
    `);

    res.json({
      stats: stats[0],
      topPolls,
      recentPolls: recentPolls[0],
      votesByDay,
      recentActivity
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get detailed results of a poll
 */
export const getPollResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Use view vw_poll_results for optimized results
    const [results] = await db.execute(`
      SELECT 
        id_poll,
        title,
        status,
        id_option,
        designation,
        total_votes
      FROM vw_poll_results 
      WHERE id_poll = ?
      ORDER BY total_votes DESC
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Total votes using English function
    const [totalVotes] = await db.execute(
      'SELECT fn_poll_total_votes(?) as total',
      [id]
    );

    const total = totalVotes[0].total || 0;
    const resultsWithPercentage = results.map(result => ({
      ...result,
      percentage: total > 0 ? (result.total_votes / total * 100).toFixed(2) : 0
    }));

    res.json({
      poll: {
        id_poll: results[0].id_poll,
        title: results[0].title,
        status: results[0].status
      },
      total_votes: total,
      results: resultsWithPercentage
    });
  } catch (error) {
    console.error('Error getting poll results:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get voting report by period
 */
export const getVotingReport = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      group_by = 'day' 
    } = req.query;

    let dateFormat = '%Y-%m-%d';
    let groupClause = 'DATE(v.vote_date)';

    if (group_by === 'week') {
      dateFormat = '%Y-%u';
      groupClause = 'YEARWEEK(v.vote_date)';
    } else if (group_by === 'month') {
      dateFormat = '%Y-%m';
      groupClause = 'DATE_FORMAT(v.vote_date, "%Y-%m")';
    }

    let baseQuery = `
      SELECT 
        DATE_FORMAT(v.vote_date, '${dateFormat}') as period,
        COUNT(*) as total_votes,
        COUNT(DISTINCT v.id_user) as unique_users,
        COUNT(DISTINCT pvo.id_poll) as voted_polls
      FROM Vote v
      JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
    `;

    let whereClause = ' WHERE 1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(v.vote_date) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(v.vote_date) <= ?';
      params.push(end_date);
    }

    const fullQuery = baseQuery + whereClause + ` GROUP BY ${groupClause} ORDER BY period`;

    const [report] = await db.execute(fullQuery, params);

    // General totals
    const [totals] = await db.execute(`
      SELECT 
        COUNT(*) as total_votes_overall,
        COUNT(DISTINCT id_user) as unique_users_overall,
        COUNT(DISTINCT pvo.id_poll) as voted_polls_overall
      FROM Vote v
      JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
      ${whereClause}
    `, params);

    res.json({
      report,
      totals: totals[0],
      period: {
        start_date,
        end_date,
        group_by
      }
    });
  } catch (error) {
    console.error('Error generating voting report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user participation statistics
 */
export const getUserParticipationStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [participation] = await db.execute(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        (SELECT COUNT(DISTINCT pvo.id_poll) FROM Vote v2 JOIN Poll_VoteOption pvo ON v2.id_poll_option = pvo.id_poll_option WHERE v2.id_user = u.id_user) as polls_participated,
        (SELECT COUNT(*) FROM Vote v3 WHERE v3.id_user = u.id_user) as total_votes_cast,
        u.last_login,
        u.created_at
      FROM User u
      WHERE u.id_user = ?
    `, [id]);

    if (participation.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Detailed voting history
    const [votingHistory] = await db.execute(`
      SELECT 
        p.id_poll,
        p.title,
        p.status,
        vo.designation as option_voted,
        v.vote_date
      FROM Vote v
      JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
      JOIN Poll p ON pvo.id_poll = p.id_poll
      JOIN VoteOption vo ON pvo.id_option = vo.id_option
      WHERE v.id_user = ?
      ORDER BY v.vote_date DESC
      LIMIT 50
    `, [id]);

    res.json({
      user: participation[0],
      votingHistory
    });
  } catch (error) {
    console.error('Error getting participation stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get engagement metrics
 */
export const getEngagementMetrics = async (req, res) => {
  try {
    const [metrics] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM User WHERE status = 'active') as active_users,
        (SELECT COUNT(*) FROM User) as total_users,
        (SELECT COUNT(*) FROM Poll WHERE status = 'active') as active_polls,
        (SELECT COUNT(*) FROM Vote WHERE vote_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as votes_24h,
        (SELECT AVG(total) FROM (
          SELECT fn_poll_total_votes(id_poll) as total 
          FROM Poll 
          WHERE status = 'closed'
        ) as avg_votes) as avg_votes_per_poll,
        (SELECT COUNT(*) / (SELECT NULLIF(COUNT(*), 0) FROM User WHERE status = 'active') * 100 
         FROM User WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as weekly_engagement_rate
    `);

    // Top creators
    const [topCreators] = await db.execute(`
      SELECT 
        u.id_user,
        u.name,
        COUNT(p.id_poll) as total_polls,
        SUM(fn_poll_total_votes(p.id_poll)) as total_votes_received,
        AVG(fn_poll_total_votes(p.id_poll)) as avg_votes_per_poll
      FROM User u
      JOIN Poll p ON u.id_user = p.id_user
      WHERE u.user_type = 'admin'
      GROUP BY u.id_user
      ORDER BY total_votes_received DESC
      LIMIT 5
    `);

    res.json({
      metrics: metrics[0],
      topCreators
    });
  } catch (error) {
    console.error('Error getting engagement metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
