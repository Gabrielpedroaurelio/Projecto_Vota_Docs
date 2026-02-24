/**
 * Controller de Resultados e Estatísticas - VotaAki
 * 
 * Utiliza views e functions do banco de dados para performance otimizada.
 * Fornece dados para dashboard e relatórios administrativos.
 */

import db from '../db/config.js';

/**
 * Obter estatísticas gerais do dashboard (Acesso Admin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Estatísticas principais usando queries otimizadas
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Usuario WHERE status = 'ativo') as total_usuarios,
        (SELECT COUNT(*) FROM Usuario WHERE tipo_usuario = 'admin') as total_admins,
        (SELECT COUNT(*) FROM Enquete) as total_enquetes,
        (SELECT COUNT(*) FROM Enquete WHERE status = 'ativa') as enquetes_ativas,
        (SELECT COUNT(*) FROM Enquete WHERE status = 'encerrada') as enquetes_encerradas,
        (SELECT COUNT(*) FROM Usuario WHERE ultimo_login >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as usuarios_online,
        (SELECT COUNT(*) FROM Voto WHERE data_voto >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as votos_ultimas_24h,
        (SELECT COUNT(*) FROM Voto WHERE data_voto >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as votos_ultima_semana
    `);

    // Top 5 enquetes mais votadas usando view
    const [topPolls] = await db.execute(`
      SELECT 
        id_enquete,
        titulo,
        SUM(total_votos) as total_votos
      FROM vw_resultado_enquete 
      GROUP BY id_enquete, titulo
      ORDER BY total_votos DESC
      LIMIT 5
    `);

    // Enquetes criadas nos últimos 30 dias
    const [recentPolls] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as ativas,
        SUM(CASE WHEN status = 'encerrada' THEN 1 ELSE 0 END) as encerradas
      FROM Enquete 
      WHERE criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Distribuição de votos por dia da semana
    const [votesByDay] = await db.execute(`
      SELECT 
        DAYNAME(data_voto) as dia_semana,
        COUNT(*) as total_votos
      FROM Voto 
      WHERE data_voto >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DAYNAME(data_voto)
      ORDER BY FIELD(DAYNAME(data_voto), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    `);

    res.json({
      stats: stats[0],
      topPolls,
      recentPolls: recentPolls[0],
      votesByDay
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter resultados detalhados de uma enquete
 */
export const getPollResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Usar view vw_resultado_enquete para resultados otimizados
    const [results] = await db.execute(`
      SELECT 
        id_enquete,
        titulo,
        status,
        id_opcao_voto,
        designacao,
        total_votos
      FROM vw_resultado_enquete 
      WHERE id_enquete = ?
      ORDER BY total_votos DESC
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Enquete não encontrada' });
    }

    // Total de votos usando function
    const [totalVotes] = await db.execute(
      'SELECT fn_total_votos_enquete(?) as total',
      [id]
    );

    // Percentuais calculados
    const total = totalVotes[0].total || 0;
    const resultsWithPercentage = results.map(result => ({
      ...result,
      percentual: total > 0 ? (result.total_votos / total * 100).toFixed(2) : 0
    }));

    res.json({
      enquete: {
        id_enquete: results[0].id_enquete,
        titulo: results[0].titulo,
        status: results[0].status
      },
      total_votos: total,
      results: resultsWithPercentage
    });
  } catch (error) {
    console.error('Erro ao obter resultados da enquete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter relatório de votação por período
 */
export const getVotingReport = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      group_by = 'day' 
    } = req.query;

    let dateFormat = '%Y-%m-%d';
    let groupClause = 'DATE(v.data_voto)';

    if (group_by === 'week') {
      dateFormat = '%Y-%u';
      groupClause = 'YEARWEEK(v.data_voto)';
    } else if (group_by === 'month') {
      dateFormat = '%Y-%m';
      groupClause = 'DATE_FORMAT(v.data_voto, "%Y-%m")';
    }

    let baseQuery = `
      SELECT 
        DATE_FORMAT(v.data_voto, '${dateFormat}') as periodo,
        COUNT(*) as total_votos,
        COUNT(DISTINCT v.id_usuario) as usuarios_unicos,
        COUNT(DISTINCT e.id_enquete) as enquetes_votadas
      FROM Voto v
      JOIN Enquete_Opcao_Voto eov ON v.id_enquete_opcao_voto = eov.id_enquete_opcao_voto
      JOIN Enquete e ON eov.id_enquete = e.id_enquete
    `;

    let whereClause = ' WHERE 1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(v.data_voto) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(v.data_voto) <= ?';
      params.push(end_date);
    }

    const fullQuery = baseQuery + whereClause + ` GROUP BY ${groupClause} ORDER BY periodo`;

    const [report] = await db.execute(fullQuery, params);

    // Totais gerais
    const [totals] = await db.execute(`
      SELECT 
        COUNT(*) as total_votos_geral,
        COUNT(DISTINCT id_usuario) as usuarios_unicos_geral,
        COUNT(DISTINCT e.id_enquete) as enquetes_votadas_geral
      FROM Voto v
      JOIN Enquete_Opcao_Voto eov ON v.id_enquete_opcao_voto = eov.id_enquete_opcao_voto
      JOIN Enquete e ON eov.id_enquete = e.id_enquete
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
    console.error('Erro ao gerar relatório de votação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter estatísticas de participação por usuário
 */
export const getUserParticipationStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Estatísticas de participação usando view
    const [participation] = await db.execute(`
      SELECT 
        u.id_usuario,
        u.nome_usuario,
        u.email_usuario,
        COUNT(DISTINCT e.id_enquete) as enquetes_participadas,
        COUNT(v.id_voto) as total_votos_realizados,
        u.ultimo_login,
        u.criado_em
      FROM Usuario u
      LEFT JOIN vw_enquetes_usuario e ON u.id_usuario = e.id_usuario
      LEFT JOIN Voto v ON u.id_usuario = (
        SELECT v2.id_usuario 
        FROM Voto v2 
        JOIN Enquete_Opcao_Voto eov2 ON v2.id_enquete_opcao_voto = eov2.id_enquete_opcao_voto 
        WHERE eov2.id_enquete = e.id_enquete
        LIMIT 1
      )
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario
    `, [id]);

    if (participation.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Histórico de votações detalhado
    const [votingHistory] = await db.execute(`
      SELECT 
        e.id_enquete,
        e.titulo,
        e.status,
        ov.designacao as opcao_votada,
        v.data_voto
      FROM Voto v
      JOIN Enquete_Opcao_Voto eov ON v.id_enquete_opcao_voto = eov.id_enquete_opcao_voto
      JOIN Enquete e ON eov.id_enquete = e.id_enquete
      JOIN OpcaoVoto ov ON eov.id_opcao_voto = ov.id_opcao_voto
      WHERE v.id_usuario = ?
      ORDER BY v.data_voto DESC
      LIMIT 50
    `, [id]);

    res.json({
      user: participation[0],
      votingHistory
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de participação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter ranking de enquetes
 */
export const getPollRanking = async (req, res) => {
  try {
    const { 
      period = 'all', 
      limit = 10,
      order = 'votes' 
    } = req.query;

    let whereClause = ' WHERE 1=1';
    const params = [];

    if (period === 'week') {
      whereClause += ' AND e.criado_em >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      whereClause += ' AND e.criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    let orderClause = 'ORDER BY total_votos DESC';
    if (order === 'participation') {
      orderClause = 'ORDER BY usuarios_unicos DESC';
    }

    const [ranking] = await db.execute(`
      SELECT 
        e.id_enquete,
        e.titulo,
        e.descricao,
        e.status,
        e.criado_em,
        e.data_fim,
        u.nome_usuario as criador,
        fn_total_votos_enquete(e.id_enquete) as total_votos,
        COUNT(DISTINCT v.id_usuario) as usuarios_unicos,
        CASE 
          WHEN e.data_fim IS NULL THEN NULL
          WHEN e.data_fim < NOW() THEN 'encerrada'
          ELSE 'ativa'
        END as status_atual
      FROM Enquete e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      LEFT JOIN Voto v ON e.id_enquete = (
        SELECT DISTINCT eov.id_enquete 
        FROM Voto v2 
        JOIN Enquete_Opcao_Voto eov2 ON v2.id_enquete_opcao_voto = eov2.id_enquete_opcao_voto 
        WHERE eov2.id_enquete = e.id_enquete
      )
      ${whereClause}
      GROUP BY e.id_enquete
      ${orderClause}
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      ranking,
      period,
      order_by: order
    });
  } catch (error) {
    console.error('Erro ao obter ranking de enquetes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter métricas de engajamento
 */
export const getEngagementMetrics = async (req, res) => {
  try {
    // Métricas de engajamento usando functions
    const [metrics] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Usuario WHERE status = 'ativo') as usuarios_ativos,
        (SELECT COUNT(*) FROM Usuario) as total_usuarios,
        (SELECT COUNT(*) FROM Enquete WHERE status = 'ativa') as enquetes_ativas,
        (SELECT COUNT(*) FROM Voto WHERE data_voto >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as votos_24h,
        (SELECT AVG(total_votos) FROM (
          SELECT fn_total_votos_enquete(id_enquete) as total_votos 
          FROM Enquete 
          WHERE status = 'encerrada'
        ) as avg_votes) as media_votos_enquete,
        (SELECT COUNT(*) / (
          SELECT COUNT(*) FROM Usuario WHERE status = 'ativo'
        ) * 100 FROM Usuario WHERE ultimo_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as taxa_engajamento_semanal
    `);

    // Tendências de votação
    const [trends] = await db.execute(`
      SELECT 
        DATE_FORMAT(data_voto, '%Y-%m-%d') as data,
        COUNT(*) as votos,
        LAG(COUNT(*), 1) OVER (ORDER BY DATE_FORMAT(data_voto, '%Y-%m-%d')) as votos_dia_anterior
      FROM Voto 
      WHERE data_voto >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(data_voto, '%Y-%m-%d')
      ORDER BY data
    `);

    // Top criadores de enquetes
    const [topCreators] = await db.execute(`
      SELECT 
        u.id_usuario,
        u.nome_usuario,
        COUNT(e.id_enquete) as total_enquetes,
        SUM(fn_total_votos_enquete(e.id_enquete)) as total_votos_recebidos,
        AVG(fn_total_votos_enquete(e.id_enquete)) as media_votos_por_enquete
      FROM Usuario u
      JOIN Enquete e ON u.id_usuario = e.id_usuario
      WHERE u.tipo_usuario = 'admin'
      GROUP BY u.id_usuario
      ORDER BY total_votos_recebidos DESC
      LIMIT 5
    `);

    res.json({
      metrics: metrics[0],
      trends,
      topCreators
    });
  } catch (error) {
    console.error('Erro ao obter métricas de engajamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
