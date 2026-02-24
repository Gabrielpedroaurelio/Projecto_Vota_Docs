/**
 * Controller de Enquetes - VotaAki
 * 
 * Responsável pela criação, listagem e visualização detalhada de enquetes,
 * utilizando transações para garantir a consistência das opções de voto.
 */

import db from '../db/config.js';

/**
 * Obter Estatísticas das Enquetes (Acesso Admin)
 */
export const getPollStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_enquetes,
        COUNT(CASE WHEN e.data_inicio <= NOW() AND e.data_fim >= NOW() THEN 1 END) as enquetes_ativas,
        COUNT(CASE WHEN e.data_inicio > NOW() THEN 1 END) as enquetes_futuras,
        COUNT(CASE WHEN e.data_fim < NOW() THEN 1 END) as enquetes_encerradas,
        COUNT(CASE WHEN e.data_criacao >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as enquetes_ultima_semana,
        COUNT(CASE WHEN e.data_criacao >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as enquetes_ultima_24h,
        COALESCE(SUM(fn_total_votos_enquete(e.id_enquete)), 0) as total_votos_geral
      FROM Enquete e
    `);
    
    res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Erro ao obter estatísticas das enquetes:', error);
    res.status(500).json({ message: 'Erro ao carregar estatísticas das enquetes.' });
  }
};

/**
 * Atualizar Enquete (Acesso Admin)
 */
export const updatePoll = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, data_inicio, data_fim } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE Enquete SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ? WHERE id_enquete = ?',
      [titulo, descricao, data_inicio, data_fim, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enquete não encontrada.' });
    }
    
    res.json({ message: 'Enquete atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar enquete:', error);
    res.status(500).json({ message: 'Erro ao atualizar enquete.' });
  }
};

/**
 * Excluir Enquete (Acesso Admin)
 */
export const deletePoll = async (req, res) => {
  const { id } = req.params;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Excluir vínculos com opções de voto
    await connection.execute(
      'DELETE FROM Enquete_Opcao_Voto WHERE id_enquete = ?',
      [id]
    );
    
    // Excluir votos associados à enquete
    await connection.execute(
      'DELETE FROM Voto WHERE id_enquete = ?',
      [id]
    );
    
    // Excluir a enquete
    const [result] = await connection.execute(
      'DELETE FROM Enquete WHERE id_enquete = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Enquete não encontrada.' });
    }
    
    await connection.commit();
    res.json({ message: 'Enquete excluída com sucesso!' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao excluir enquete:', error);
    res.status(500).json({ message: 'Erro ao excluir enquete.' });
  } finally {
    connection.release();
  }
};

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

    // 2. Cria as opções de voto e vincula-as à enquete
    for (const opt of opcoes) {
      // Insere a definição da opção
      const [optResult] = await connection.execute(
        'INSERT INTO OpcaoVoto (designacao, descricao) VALUES (?, ?)',
        [opt.designacao, opt.descricao || '']
      );
      const id_opcao_voto = optResult.insertId;

      // Cria o vínculo na tabela de junção
      await connection.execute(
        'INSERT INTO Enquete_Opcao_Voto (id_enquete, id_opcao_voto) VALUES (?, ?)',
        [id_enquete, id_opcao_voto]
      );
    }

    // Confirma todas as inserções
    await connection.commit();
    res.status(201).json({ message: 'Enquete publicada com sucesso!', id_enquete });
  } catch (error) {
    // Em caso de erro, reverte todas as alterações parciais
    await connection.rollback();
    console.error('Erro ao Criar Enquete:', error);
    res.status(500).json({ message: 'Falha ao processar a criação da enquete.' });
  } finally {
    // Liberta a ligação de volta para a pool
    connection.release();
  }
};

/**
 * Listar Todas as Enquetes
 */
export const getPolls = async (req, res) => {
  try {
    const [polls] = await db.execute(`
      SELECT 
        e.*, 
        u.nome_usuario as criador,
        fn_total_votos_enquete(e.id_enquete) as total_votos
      FROM Enquete e 
      JOIN Usuario u ON e.id_usuario = u.id_usuario 
      ORDER BY e.data_inicio DESC
    `);
    res.json(polls);
  } catch (error) {
    console.error('Erro ao Listar Enquetes:', error);
    res.status(500).json({ message: 'Não foi possível carregar as enquetes.' });
  }
};

/**
 * Obter Detalhes de uma Enquete Específica
 */
export const getPollById = async (req, res) => {
  const { id } = req.params;
  try {
    // Procura os dados da enquete e o nome do criador
    const [polls] = await db.execute(`
      SELECT e.*, u.nome_usuario as criador, 
             fn_total_votos_enquete(e.id_enquete) as total_votos
      FROM Enquete e
      JOIN Usuario u ON e.id_usuario = u.id_usuario
      WHERE id_enquete = ?
    `, [id]);
    
    if (polls.length === 0) {
      return res.status(404).json({ message: 'Enquete não encontrada.' });
    }

    // Procura as opções associadas a esta enquete
    const [options] = await db.execute(`
      SELECT ov.* 
      FROM OpcaoVoto ov 
      JOIN Enquete_Opcao_Voto eov ON ov.id_opcao_voto = eov.id_opcao_voto 
      WHERE eov.id_enquete = ?
    `, [id]);

    res.json({ ...polls[0], opcoes: options });
  } catch (error) {
    console.error('Erro ao Obter Enquete:', error);
    res.status(500).json({ message: 'Erro ao carregar detalhes da enquete.' });
  }
};
