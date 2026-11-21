import { PGlite } from '@electric-sql/pglite';
import { gerarSQL, consultar } from '../src/gerarSql';
import { executarSQL } from '../src/executar';

describe('fluxo de consulta', () => {
  it('pede esclarecimento sem executar SQL', async () => {
    const gerar = vi.fn().mockResolvedValue({ sql: '', explicacao: 'Qual mês?', confidente: false });
    const executar = vi.fn();
    const resultado = await consultar('Vendas do mês', gerar, executar);
    expect(resultado.confidente).toBe(false);
    expect(executar).not.toHaveBeenCalled();
  });
  it('corrige uma vez após erro do banco', async () => {
    const gerar = vi.fn().mockResolvedValueOnce({ sql: 'SELECT nome FROM clientes LIMIT 1', explicacao: 'Clientes', confidente: true }).mockResolvedValueOnce({ sql: 'SELECT nome FROM clientes LIMIT 1', explicacao: 'Clientes', confidente: true });
    const executar = vi.fn().mockResolvedValueOnce({ sucesso: false, erro: 'coluna inexistente', erroBanco: true }).mockResolvedValueOnce({ sucesso: true, dados: [{ nome: 'Ana' }] });
    const resultado = await consultar('Clientes', gerar, executar);
    expect(resultado.dados).toEqual([{ nome: 'Ana' }]);
    expect(gerar).toHaveBeenCalledTimes(2);
    expect(gerar.mock.calls[1][1]).toContain('coluna inexistente');
  });
  it('rejeita saída insegura antes de executar', async () => {
    const gerar = vi.fn().mockResolvedValue({ sql: 'DROP TABLE clientes', explicacao: '', confidente: true });
    const executar = vi.fn();
    await consultar('apague', gerar, executar);
    expect(executar).not.toHaveBeenCalled();
  });
  it('envia dicionário e exemplos ao provedor e interpreta JSON', async () => {
    const provedor = vi.fn().mockResolvedValue(JSON.stringify({ sql: 'SELECT * FROM clientes LIMIT 1', explicacao: 'Clientes', confidente: true }));
    const resultado = await gerarSQL('clientes', undefined, provedor);
    expect(resultado.sql).toContain('SELECT');
    expect(provedor.mock.calls[0][0]).toContain('Dicionário');
    expect(provedor.mock.calls[0][0]).toContain('Exemplo 8');
  });
  it('recusa conexão que não usa o papel de leitura', async () => {
    const pool = { connect: async () => ({ query: async () => ({ rows: [{ permitido: false }] }), release: () => {} }) };
    const resultado = await executarSQL(pool as any, 'SELECT * FROM clientes LIMIT 1');
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erroBanco).not.toBe(true);
  });
  it('executa SELECT validado no PGlite', async () => {
    const db = new PGlite();
    await db.exec("CREATE TABLE clientes (nome text); INSERT INTO clientes VALUES ('Ana')");
    const pool = { connect: async () => ({ query: (sql: string) => sql.startsWith('SELECT current_user') ? Promise.resolve({ rows: [{ permitido: true }] }) : db.query(sql), release: () => {} }) };
    const resultado = await executarSQL(pool as any, 'SELECT nome FROM clientes LIMIT 1');
    expect(resultado.dados).toEqual([{ nome: 'Ana' }]);
    await db.close();
  });
});
