import { Pool } from 'pg';
import { validarSQL, ResultadoValidacao } from './validarSql';

export interface ResultadoExecucao {
  sucesso: boolean;
  dados?: any[];
  colunas?: string[];
  tempo_execucao_ms: number;
  total_resultados: number;
  erro?: string;
  timeout?: boolean;
}

// Timeout de execucao (30 segundos)
const TIMEOUT_MS = 30000;

export async function executarSQL(
  pool: Pool,
  sql: string,
  limiteResultados: number = 100
): Promise<ResultadoExecucao> {
  const inicio = Date.now();

  try {
    // Validar antes de executar
    const validacao = validarSQL(sql);
    if (!validacao.valido) {
      return {
        sucesso: false,
        erro: `Validacao falhou: ${validacao.erros.join(', ')}`,
        tempo_execucao_ms: Date.now() - inicio,
        total_resultados: 0
      };
    }

    // Aplicar limite se nao existir
    let sqlFinal = sql.trim();
    if (!/\bLIMIT\s+\d+/i.test(sqlFinal)) {
      sqlFinal = sqlFinal.replace(/;\s*$/i, '') + ` LIMIT ${limiteResultados}`;
    }

    // Executar com timeout
    const cliente = await pool.connect();
    let resultado: any;

    try {
      // Configurar timeout para esta conexao
      await cliente.query('SET statement_timeout = $1', [TIMEOUT_MS]);
      resultado = await cliente.query(sqlFinal);
    } finally {
      cliente.release();
    }

    const tempoExecucao = Date.now() - inicio;

    return {
      sucesso: true,
      dados: resultado.rows,
      colunas: resultado.fields.map((f: any) => f.name),
      tempo_execucao_ms: tempoExecucao,
      total_resultados: resultado.rowCount || resultado.rows.length
    };

  } catch (e: any) {
    const tempoExecucao = Date.now() - inicio;

    // Verificar se e' timeout
    if (e.code === '40P01' || e.message?.includes('timeout') || e.message?.includes('cancel')) {
      return {
        sucesso: false,
        erro: 'Consulta excedeu o tempo maximo de execucao (30 segundos)',
        tempo_execucao_ms: tempoExecucao,
        total_resultados: 0,
        timeout: true
      };
    }

    // Erro de sintaxe
    if (e.code === '42601' || e.code === '42601') {
      return {
        sucesso: false,
        erro: `Erro de sintaxe SQL: ${e.message}`,
        tempo_execucao_ms: tempoExecucao,
        total_resultados: 0
      };
    }

    // Erro de referencia (tabela/coluna inexistente)
    if (e.code === '42703') {
      return {
        sucesso: false,
        erro: `Erro de referencia: ${e.message}`,
        tempo_execucao_ms: tempoExecucao,
        total_resultados: 0
      };
    }

    return {
      sucesso: false,
      erro: `Erro ao executar consulta: ${e.message}`,
      tempo_execucao_ms: tempoExecucao,
      total_resultados: 0
    };
  }
}

// Obter informacoes da visao
export async function obterEsquemaVisao(pool: Pool, nomeVisao: string): Promise<{
  colunas: Array<{ nome: string, tipo: string, descricao?: string }>;
  existe: boolean;
}> {
  if (!validarConsultaVisao(nomeVisao)) {
    return { colunas: [], existe: false };
  }

  const query = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `;

  try {
    const resultado = await pool.query(query, [nomeVisao]);
    return {
      colunas: resultado.rows.map((r: any) => ({
        nome: r.column_name,
        tipo: r.data_type,
        descricao: undefined
      })),
      existe: true
    };
  } catch {
    return { colunas: [], existe: false };
  }
}