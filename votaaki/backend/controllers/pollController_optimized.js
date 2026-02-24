/**
 * Controller de Enquetes - VotaAki (Versão Otimizada)
 * 
 * Responsável pela criação, listagem e visualização detalhada de enquetes,
 * utilizando transações para garantir a consistência das opções de voto e
 * functions do banco para performance otimizada.
 */

import db from '../db/config.js';

/**
 * Criar uma Nova Enquete (Acesso Restrito a Admin)
 */
export const createPoll = async (req, res) => {
  const { titulo, descricao, data_inicio, data_fim, opcoes } = req.body;
  const id_usuario = req.user.id; // ID do utilizador autenticado via middleware

  // Validação: No mínimo duas opções de voto
  if (!opcoes || opcoes.length < 2) {
    return res.status(400).json({ message: 'Uma enquete deve ter no mínimo duas opções de voto.' });
  }

  const connection = await db.getConnection();
  try {
    // Inicia a transação SQL
    await connection.beginTransaction();

    // 1. Insere a Enquete principal
    const [enqueteResult] = await connection.execute(
      'INSERT INTO Enquete (titulo, descricao, data_inicio, data_fim, id_usuario) VALUES (?, ?, ?, ?, ?)',
      [titulo, descricao, data_inicio || new Date(), data_fim, id_usuario]
    );

    const id_enquete = enqueteResult.insertId;

    // 2. Insere as opções de voto em lote
    const opcoesValues = opcoes.map(opcao => [id_enquete, opcao.id_opcao_voto]);
    await connection.query(
      'INSERT INTO Enquete_Opcao_Voto (id_enquete, id_opcao_voto) VALUES ?',
      [opcoesValues]
    );

    // Confirma a transação
    await connection.commit();

    // Busca a enquete completa com opções usando function para total de votos
    const [pollWithVotes] = await connection.execute(`
      SELECT 
        e.*,
        u.nome_usuario as criador,
        fn_total_votos_enquete(e.id_enquete) as total_votos
      FROM Enquete e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      WHERE e.id_enquete = ?
    `, [id_enquete]);

    // Busca as opções da enquete
    const [pollOptions] = await connection.execute(`
      SELECT 
        ov.id_opcao_voto,
        ov.designacao,
        ov.descricao,
        fn_total_votos_opcao(?, ov.id_opcao_voto) as total_votos
      FROM OpcaoVoto ov
      JOIN Enquete_Opcao_Voto eov ON ov.id_opcao_voto = eov.id_opcao_voto
      WHERE eov.id_enquete = ?
      ORDER BY ov.id_opcao_voto
    `, [id_enquete, id_enquete]);

    res.status(201).json({
      message: 'Enquete criada com sucesso',
      enquete: {
        ...pollWithVotes[0],
        opcoes: pollOptions
      }
    });

  } catch (error) {
    // Rollback em caso de erro
    await connection.rollback();
    console.error('Erro ao criar enquete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    connection.release();
  }
};

/**
 * Listar todas as Enquetes (Público) - Versão Otimizada
 */
export const getPollsOptimized = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      sort_by = 'criado_em',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filtro por busca
    if (search) {
      whereClause += ' AND (e.titulo LIKE ? OR e.descricao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filtro por status
    if (status !== 'all') {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    // Validação do campo de ordenação
    const validSortFields = ['criado_em', 'data_fim', 'titulo', 'total_votos'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'criado_em';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Query principal usando view e functions
    const [polls] = await db.execute(`
      SELECT 
        e.id_enquete,
        e.titulo,
        e.descricao,
        e.data_inicio,
        e.data_fim,
        e.status,
        e.criado_em,
        u.nome_usuario as criador,
        u.email_usuario as email_criador,
        fn_total_votos_enquete(e.id_enquete) as total_votos,
        CASE 
          WHEN e.data_fim IS NULL THEN NULL
          WHEN e.data_fim < NOW() THEN 'encerrada'
          ELSE 'ativa'
        END as status_atual
      FROM Enquete e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total para paginação
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM Enquete e 
      ${whereClause}
    `, params);

    const total = countResult[0].total;

    res.json({
      polls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar enquetes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Obter Enquete por ID (Público) - Versão Otimizada
 */
export const getPollByIdOptimized = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar enquete usando function para total de votos
    const [polls] = await db.execute(`
      SELECT 
        e.*,
        u.nome_usuario as criador,
        u.email_usuario as email_criador,
        fn_total_votos_enquete(e.id_enquete) as total_votos,
        CASE 
          WHEN e.data_fim IS NULL THEN NULL
          WHEN e.data_fim < NOW() THEN 'encerrada'
          ELSE 'ativa'
        END as status_atual
      FROM Enquete e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      WHERE e.id_enquete = ?
    `, [id]);

    if (polls.length === 0) {
      return res.status(404).json({ message: 'Enquete não encontrada' });
    }

    const poll = polls[0];

    // Buscar opções da enquete usando function para votos por opção
    const [options] = await db.execute(`
      SELECT 
        ov.id_opcao_voto,
        ov.designacao,
        ov.descricao,
        fn_total_votos_opcao(?, ov.id_opcao_voto) as total_votos
      FROM OpcaoVoto ov
      JOIN Enquete_Opcao_Voto eov ON ov.id_opcao_voto = eov.id_opcao_voto
      WHERE eov.id_enquete = ?
      ORDER BY ov.id_opcao_voto
    `, [id, id]);

    // Verificar se usuário já votou (se estiver autenticado)
    let usuario_ja_votou = false;
    if (req.user) {
      const [voteCheck] = await db.execute(`
        SELECT COUNT(*) as count
        FROM Voto v
        JOIN Enquete_Opcao_Voto eov ON v.id_enquete_opcao_voto = eov.id_enquete_opcao_voto
        WHERE v.id_usuario = ? AND eov.id_enquete = ?
      `, [req.user.id, id]);

      usuario_ja_votou = voteCheck[0].count > 0;
    }

    res.json({
      ...poll,
      opcoes: options,
      usuario_ja_votou
    });

  } catch (error) {
    console.error('Erro ao obter enquete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
