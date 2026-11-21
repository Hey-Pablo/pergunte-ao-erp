import { Router, Request, Response } from 'express';
import { validarSQL, validarConsultaVisao } from '../../validarSql';

export function validarSqlRouter() {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { sql } = req.body;

      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({
          erro: 'Campo "sql" e obrigatorio e deve ser string'
        });
      }

      const resultado = validarSQL(sql);

      res.json({
        valido: resultado.valido,
        erros: resultado.erros,
        sql: resultado.valido ? sql : undefined,
        sql_corrigido: resultado.sql_corrigido
      });

    } catch (e: any) {
      console.error('Erro ao validar SQL:', e);
      res.status(500).json({
        erro: 'Erro interno ao validar SQL'
      });
    }
  });

  router.get('/tabelas', (_req: Request, res: Response) => {
    const tabelas = [
      'clientes', 'produtos', 'fornecedores', 'filiais', 'titulos',
      'notas_fiscais', 'itens_nota', 'movimentos_estoque',
      'v_saldo_estoque', 'v_titulos_vencidos',
      'v_indicadores_faturamento', 'v_clientes_inadimplentes'
    ];

    res.json({ tabelas });
  });

  return router;
}