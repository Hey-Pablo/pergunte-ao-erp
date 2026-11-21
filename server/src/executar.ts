import { Pool } from 'pg';
import { validarSQL, validarConsultaVisao } from './validarSql';

export interface ResultadoExecucao {
  sucesso: boolean;
  dados?: any[];
  colunas?: string[];
  tempo_execucao_ms: number;
  total_resultados: number;
  erro?: string;
  erroBanco?: boolean;
  timeout?: boolean;
}

export async function executarSQL(pool: Pool, sql: string): Promise<ResultadoExecucao> {
  const inicio = Date.now();
  const vazio = () => ({ tempo_execucao_ms: Date.now() - inicio, total_resultados: 0 });
  if (!validarSQL(sql).valido) return { sucesso: false, erro: 'Consulta recusada pelo validador.', ...vazio() };
  let cliente;
  try {
    cliente = await pool.connect();
    const papel = await cliente.query("SELECT current_user = 'reader_user' AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolreplication AND NOT rolbypassrls AND NOT EXISTS (SELECT 1 FROM pg_auth_members WHERE member = r.oid) AS permitido FROM pg_roles r WHERE rolname = current_user");
    if (!papel.rows[0]?.permitido) return { sucesso: false, erro: 'Conexão exige papel reader_user sem privilégios elevados.', ...vazio() };
    await cliente.query('BEGIN READ ONLY');
    await cliente.query("SET LOCAL statement_timeout = '30s'");
    const resultado = await cliente.query(sql);
    await cliente.query('COMMIT');
    return { sucesso: true, dados: resultado.rows, colunas: resultado.fields.map(f => f.name), total_resultados: resultado.rows.length, tempo_execucao_ms: Date.now() - inicio };
  } catch (e: any) {
    if (cliente) await cliente.query('ROLLBACK').catch(() => {});
    return { sucesso: false, erro: String(e.message || 'Erro ao executar consulta'), erroBanco: true, timeout: e.code === '57014', ...vazio() };
  } finally { cliente?.release(); }
}

export async function obterEsquemaVisao(pool: Pool, nomeVisao: string): Promise<{ colunas: Array<{ nome: string; tipo: string }>; existe: boolean }> {
  if (!validarConsultaVisao(nomeVisao)) return { colunas: [], existe: false };
  const resultado = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position", [nomeVisao]);
  return { colunas: resultado.rows.map(r => ({ nome: r.column_name, tipo: r.data_type })), existe: resultado.rows.length > 0 };
}
