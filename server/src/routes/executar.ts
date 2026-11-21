import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { executarSQL, obterEsquemaVisao } from '../executar';
import { validarSQL, validarConsultaVisao } from '../validarSql';

export function executarRouter() {
  const router = Router();

  let pool: Pool | null = null;

  function getPool(): Pool {
    if (!pool) {
      if (!process.env.READER_DATABASE_URL) throw new Error('READER_DATABASE_URL ausente');
      pool = new Pool({
        connectionString: process.env.READER_DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
    return pool;
  }

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { sql, limite } = req.body;

      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({
          erro: 'Campo "sql" e obrigatorio e deve ser string'
        });
      }

      const validacao = validarSQL(sql);
      if (!validacao.valido) {
        return res.status(400).json({
          erro: 'Validacao falhou',
          detalhes: validacao.erros
        });
      }

      // Executar a consulta
      const resultado = await executarSQL(getPool(), sql);

      if (!resultado.sucesso) {
        return res.status(400).json({
          erro: 'Não foi possível executar a consulta.',
          tempo_execucao_ms: resultado.tempo_execucao_ms,
          timeout: resultado.timeout || false
        });
      }

      res.json({
        dados: resultado.dados,
        colunas: resultado.colunas,
        total_resultados: resultado.total_resultados,
        tempo_execucao_ms: resultado.tempo_execucao_ms
      });

    } catch (e: any) {
      console.error('Erro ao executar SQL:', e);
      res.status(500).json({
        erro: 'Erro interno ao executar consulta',
        mensagem: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
    }
  });

  router.get('/visao/:nome', async (req: Request, res: Response) => {
    const { nome } = req.params;

    if (!validarConsultaVisao(nome)) {
      return res.status(400).json({
        erro: `Visao '${nome}' nao esta disponivel`
      });
    }

    const esquema = await obterEsquemaVisao(getPool(), nome);

    if (!esquema.existe) {
      return res.status(404).json({
        erro: `Visao '${nome}' nao existe no banco`
      });
    }

    res.json({
      nome,
      colunas: esquema.colunas
    });
  });

  router.get('/visoes', (_req: Request, res: Response) => {
    res.json({
      visoes: [
        {
          nome: 'v_saldo_estoque',
          descricao: 'Saldo atual de todos os produtos ativos',
          colunas: ['produto_id', 'codigo', 'descricao', 'saldo_atual', 'estoque_minimo']
        },
        {
          nome: 'v_titulos_vencidos',
          descricao: 'Titulos com datas de vencimento',
          colunas: ['titulo_id', 'codigo', 'tipo', 'data_vencimento', 'valor', 'status', 'dias_em_vencimento', 'classificacao_vencimento']
        },
        {
          nome: 'v_indicadores_faturamento',
          descricao: 'Indicadores de faturamento mensal',
          colunas: ['mes_ano', 'quantidade_notas', 'faturamento_bruto', 'icms', 'ipi', 'clientes_distintos']
        },
        {
          nome: 'v_clientes_inadimplentes',
          descricao: 'Clientes com titulos em aberto',
          colunas: ['cliente_id', 'codigo', 'razao_social', 'cnpj', 'total_titulos', 'titulos_em_aberto', 'valor_em_aberto', 'ultimo_vencimento']
        }
      ]
    });
  });

  return router;
}