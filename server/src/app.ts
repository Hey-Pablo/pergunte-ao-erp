import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Carregar variaveis de ambiente
dotenv.config({ path: '../.env' });

import { criarServidor } from './server';

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parsing de JSON
app.use(express.json({ limit: '1mb' }));

// Logging
app.use(morgan('dev'));

// Rotas
app.use('/api', criarServidor());

// Middleware de erro
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;