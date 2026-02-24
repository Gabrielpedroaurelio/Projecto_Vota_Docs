/**
 * Controller de Votos - VotaAki
 * 
 * Gere o processo de submissão de votos e a visualização de resultados estatísticos.
 */

import db from '../db/config.js';

/**
 * Registar um Voto
 */
export const vote = async (req, res) => {
  const { id_enquete, id_opcao_voto } = req.body;
  const id_usuario = req.user.id; // Identificado via JWT

  try {
    // 1. Verifica se o utilizador já votou nesta enquete
    const [existingVote] = await db.execute(
      'SELECT * FROM Voto WHERE id_usuario = ? AND id_enquete = ?',
      [id_usuario, id_enquete]
    );

    if (existingVote.length > 0) {
      return res.status(400).json({ message: 'Já registou o seu voto nesta enquete. Agradecemos a participação.' });
    }

    // 2. Tenta inserir o voto
    // Nota: A base de dados possui uma Trigger (trg_bloqueia_voto_enquete_encerrada)
    // que impede votos em enquetes fora do prazo.
    await db.execute(
      'INSERT INTO Voto (id_usuario, id_enquete, id_opcao_voto) VALUES (?, ?, ?)',
      [id_usuario, id_enquete, id_opcao_voto]
    );

    res.status(201).json({ message: 'Voto contabilizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao Votar:', error);
    
    // Tratamento de erros lançados por Triggers ou Constraints SQL (State 45000)
    if (error.sqlState === '45000') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Não foi possível registar o seu voto.' });
  }
};

/**
 * Obter Resultados da Enquete
 */
export const getResults = async (req, res) => {
  const { id } = req.params;

  try {
    // Procura os resultados consolidados na View SQL
    const [results] = await db.execute(
      'SELECT designacao, id_opcao_voto, total_votos FROM vw_resultado_enquete WHERE id_enquete = ?',
      [id]
    );

    // Obtém o somatório total de votos da enquete via função SQL
    const [totalResult] = await db.execute(
      'SELECT fn_total_votos_enquete(?) as total',
      [id]
    );

    res.json({
      results,
      total: totalResult[0].total
    });
  } catch (error) {
    console.error('Erro ao Consultar Resultados:', error);
    res.status(500).json({ message: 'Erro ao processar as estatísticas da enquete.' });
  }
};
