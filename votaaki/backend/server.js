
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importação das rotas utilizando a sintaxe ES Modules
import authRoutes from './routes/auth.js';
import pollRoutes from './routes/polls.js';
import voteRoutes from './routes/votes.js';
import userRoutes from './routes/users.js';
import resultRoutes from './routes/results.js';
import optionRoutes from './routes/options.js';

// Configuração das variáveis de ambiente (.env)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Garantir que o JWT_SECRET existe
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'votaaki_emergency_secret_key_2024';
  console.warn('AVISO: JWT_SECRET não encontrado no .env. Usando chave de emergência.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para permitir requisições de origens diferentes (CORS)
app.use(cors());

// Middleware para processar corpos de requisições em formato JSON
app.use(express.json());

// Definição das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/options', optionRoutes);

// Rota base para verificação de status do servidor
app.get('/', (req, res) => {
  res.send('Servidor Online');
});

// Inicialização do servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Servidor Rodando: http://localhost:${PORT}`);
});
