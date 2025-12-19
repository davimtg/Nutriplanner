import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Você faz um fetch a 'localhost:3001/alguma-coisa"
app.get('/test', (req, res) => {
  // E aqui se tem a resposta
  res.send('teste');
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
