import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import apiRoutes from './src/routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão DB
connectDB();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API Nutriplanner Rodando');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
