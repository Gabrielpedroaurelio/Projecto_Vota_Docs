/**
 * Controller de Opções de Voto - VotaAki
 * 
 * Responsável pela gestão individual das opções de voto associadas às enquetes.
 */

import db from '../db/config.js';

/**
 * Listar todas as opções de voto de todas as enquetes
 */
export const getOptions = async (req, res) => {
  try {
    const [options] = await db.execute(`
      SELECT ov.*, e.titulo as titulo_enquete, eov.id_enquete
      FROM OpcaoVoto ov 
      JOIN Enquete_Opcao_Voto eov ON ov.id_opcao_voto = eov.id_opcao_voto
      JOIN Enquete e ON eov.id_enquete = e.id_enquete
      ORDER BY ov.criado_em DESC
    `);

    res.json(options);
  } catch (error) {
    console.error('Erro ao listar todas as opções:', error);
    res.status(500).json({ message: 'Erro ao carregar opções de voto.' });
  }
};

/**
 * Listar todas as opções de uma enquete específica
 */
export const getOptionsByPoll = async (req, res) => {
  const { id } = req.params;
  try {
    const [options] = await db.execute(`
      SELECT ov.*, e.titulo as titulo_enquete, eov.id_enquete
      FROM OpcaoVoto ov 
      JOIN Enquete_Opcao_Voto eov ON ov.id_opcao_voto = eov.id_opcao_voto 
      JOIN Enquete e ON eov.id_enquete = e.id_enquete
      WHERE eov.id_enquete = ?
    `, [id]);

    res.json(options);
  } catch (error) {
    console.error('Erro ao listar opções da enquete:', error);
    res.status(500).json({ message: 'Erro ao carregar opções da enquete.' });
  }
};

/**
 * Criar uma nova opção e vincular a uma enquete
 */
export const createOption = async (req, res) => {
  const { designacao, descricao, id_enquete } = req.body;

  if (!designacao || !id_enquete) {
    return res.status(400).json({ message: 'Designação e ID da enquete são obrigatórios.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Inserir a opção
    const [optResult] = await connection.execute(
      'INSERT INTO OpcaoVoto (designacao, descricao) VALUES (?, ?)',
      [designacao, descricao || '']
    );
    const id_opcao_voto = optResult.insertId;

    // 2. Criar o vínculo com a enquete
    await connection.execute(
      'INSERT INTO Enquete_Opcao_Voto (id_enquete, id_opcao_voto) VALUES (?, ?)',
      [id_enquete, id_opcao_voto]
    );

    await connection.commit();
    res.status(201).json({ message: 'Opção de voto criada com sucesso!', id_opcao_voto });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar opção de voto:', error);
    res.status(500).json({ message: 'Erro ao criar opção de voto.' });
  } finally {
    connection.release();
  }
};

/**
 * Atualizar uma opção existente
 */
export const updateOption = async (req, res) => {
  const { id } = req.params;
  const { designacao, descricao } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE OpcaoVoto SET designacao = ?, descricao = ? WHERE id_opcao_voto = ?',
      [designacao, descricao || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Opção de voto não encontrada.' });
    }

    res.json({ message: 'Opção de voto atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar opção de voto:', error);
    res.status(500).json({ message: 'Erro ao atualizar opção de voto.' });
  }
};

/**
 * Excluir uma opção de voto
 */
export const deleteOption = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Remover vínculos
    await connection.execute(
      'DELETE FROM Enquete_Opcao_Voto WHERE id_opcao_voto = ?',
      [id]
    );

    // 2. Remover votos associados (opcional, dependendo da regra de negócio - aqui vamos remover para evitar órfãos)
    await connection.execute(
      'DELETE FROM Voto WHERE id_enquete_opcao_voto IN (SELECT id_enquete_opcao_voto FROM Enquete_Opcao_Voto WHERE id_opcao_voto = ?)',
      [id]
    );

    // 3. Remover a opção
    const [result] = await connection.execute(
      'DELETE FROM OpcaoVoto WHERE id_opcao_voto = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Opção de voto não encontrada.' });
    }

    await connection.commit();
    res.json({ message: 'Opção de voto excluída com sucesso!' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao excluir opção de voto:', error);
    res.status(500).json({ message: 'Erro ao excluir opção de voto.' });
  } finally {
    connection.release();
  }
};
