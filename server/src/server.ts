import express from 'express';
import { criarLimite } from './limite';
import { gerarSqlRouter } from './routes/gerarSql';
import { validarSqlRouter } from './routes/validarSql';
import { executarRouter } from './routes/executar';

export function criarServidor() {
  const router = express.Router();

  // Limite por IP e processo, apropriado apenas para demonstração local.
  const permitir = criarLimite(30, 60_000);
  router.use((req, res, next) => {
    if (req.method === 'POST' && !permitir(req.ip || 'desconhecido')) {
      return res.status(429).json({ erro: 'Limite de consultas atingido. Tente novamente em um minuto.' });
    }
    next();
  });

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