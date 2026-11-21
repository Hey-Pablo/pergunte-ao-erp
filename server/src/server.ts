import express from 'express';
import { gerarSqlRouter } from './routes/gerarSql';
import { validarSqlRouter } from './routes/validarSql';
import { executarRouter } from './routes/executar';

export function criarServidor() {
  const router = express.Router();

  // Rotas principais
  router.use('/gerar-sql', gerarSqlRouter());
  router.use('/validar-sql', validarSqlRouter());
  router.use('/executar', executarRouter());

  // Rota de teste
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', servico: 'pergunte-ao-erp-api' });
  });

  return router;
}