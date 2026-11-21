import { Router } from 'express';
import { Pool } from 'pg';
import { consultar, gerarSQL } from '../gerarSql';
import { executarSQL } from '../executar';

export function gerarSqlRouter() {
  const router = Router();
  router.post('/', async (req, res) => {
    const { pergunta } = req.body || {};
    if (typeof pergunta !== 'string' || !pergunta.trim() || pergunta.length > 2000) return res.status(400).json({ erro: 'Pergunta inválida.' });
    if (!process.env.READER_DATABASE_URL) return res.status(503).json({ erro: 'Configure READER_DATABASE_URL.' });
    const pool = new Pool({ connectionString: process.env.READER_DATABASE_URL, max: 2 });
    try {
      const resultado = await consultar(pergunta, gerarSQL, sql => executarSQL(pool, sql));
      return res.json(resultado);
    } catch {
      return res.status(502).json({ erro: 'Não foi possível gerar a consulta.' });
    } finally { await pool.end(); }
  });
  return router;
}
