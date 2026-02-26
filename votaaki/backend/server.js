
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/auth.js';
import pollRoutes from './routes/polls.js';
import voteRoutes from './routes/votes.js';
import userRoutes from './routes/users.js';
import resultRoutes from './routes/results.js';
import optionRoutes from './routes/options.js';

// Environment Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Security Check: JWT_SECRET
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'votaaki_emergency_secret_key_2024';
  console.warn('WARNING: JWT_SECRET not found in .env. Using EMERGENCY secret key.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Route Definitions
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/options', optionRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('VotaAki API - Server Online');
});

// Server Initialization
app.listen(PORT, () => {
  console.log(`Server Running at: http://localhost:${PORT}`);
});
