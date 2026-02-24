/**
 * Script de Criação de Administrador - VotaAki
 * 
 * Este utilitário deve ser executado para criar um administrador inicial
 * no sistema. Permite o acesso imediato às funcionalidades de gestão.
 */

import db from '../db/config.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Garante que as variáveis de ambiente estão disponíveis
dotenv.config();

/**
 * Executa a lógica de criação do Admin principal
 */
async function createAdmin() {
  const nome = 'Administrador Sistema';
  const email = 'admin@gmail.com';
  const senha = '20070404'; 
  console.log(process.env.DB_USER);
  

  try {
    // 1. Verifica se já existe um administrador com este email
    const [existing] = await db.execute('SELECT * FROM Usuario WHERE email_usuario = ?', [email]);
    if (existing.length > 0) {
      console.log('Informação: O utilizador administrador já se encontra registado.');
      process.exit(0);
    }

    // 2. Encripta a password para armazenamento na BD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // 3. Insere o administrador com privilégios de 'admin'
    await db.execute(
      'INSERT INTO Usuario (nome_usuario, email_usuario, senha_usuario, tipo_usuario, status) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, 'admin', 'ativo']
    );

    console.log('✅ Sucesso: Administrador criado com as seguintes credenciais:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Senha: ${senha}`);
    console.log('⚠️ Recomenda-se a alteração da password após o acesso inicial.');
  } catch (error) {
    console.error('❌ Erro: Falha ao criar o administrador:', error);
  } finally {
    // Encerra a execução do script de forma segura
    process.exit(0);
  }
}

// Inicia o processo
createAdmin();
