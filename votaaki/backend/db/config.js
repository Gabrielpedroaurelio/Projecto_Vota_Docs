import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para obter o caminho do diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as variáveis de ambiente explicitamente do ficheiro .env na pasta raiz do backend
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Criação da pool de conexões utilizando variáveis de ambiente.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST||"localhost",
  user: process.env.DB_USER||"root",
  password: process.env.DB_PASSWORD||"",
  database: process.env.DB_NAME||"vota_aqui",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
