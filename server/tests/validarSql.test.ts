import { validarSQL, validarConsultaVisao } from '../server/src/validarSql';

describe('Validador SQL', () => {
  describe('validarSQL', () => {
    it('aceita SELECT valido com LIMIT', () => {
      const sql = 'SELECT * FROM clientes LIMIT 10';
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });

    it('rejeita INSERT', () => {
      const sql = "INSERT INTO clientes (nome) VALUES ('Teste')";
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
      expect(resultado.erros).toContain('Apenas consultas SELECT sao permitidas');
    });

    it('rejeita UPDATE', () => {
      const sql = "UPDATE clientes SET ativo = FALSE";
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
    });

    it('rejeita DELETE', () => {
      const sql = "DELETE FROM clientes WHERE cliente_id = 1";
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
    });

    it('rejeita DROP', () => {
      const sql = "DROP TABLE clientes";
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
    });

    it('rejeita consulta sem LIMIT', () => {
      const sql = 'SELECT * FROM clientes';
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
      expect(resultado.erros).toContain('Consulta deve ter LIMIT para limitar resultados');
    });

    it('rejeita tabela nao permitida', () => {
      const sql = 'SELECT * FROM tabela_exclusiva LIMIT 10';
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('nao esta na lista'))).toBe(true);
    });

    it('aceita consultas com JOINs de tabelas permitidas', () => {
      const sql = 'SELECT c.nome, p.descricao FROM clientes c JOIN notas_fiscais n ON c.cliente_id = n.cliente_id LIMIT 10';
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(true);
    });

    it('rejeita limite muito alto', () => {
      const sql = 'SELECT * FROM clientes LIMIT 15000';
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('limite') || e.includes('10000'))).toBe(true);
    });

    it('rejeita operacao perigosa', () => {
      const sql = 'SELECT * FROM clientes WHERE pg_sleep(10)';
      const resultado = validarSQL(sql);
      expect(resultado.valido).toBe(false);
    });
  });

  describe('validarConsultaVisao', () => {
    it('aceita visao permitida', () => {
      expect(validarConsultaVisao('v_saldo_estoque')).toBe(true);
      expect(validarConsultaVisao('clientes')).toBe(true);
    });

    it('rejeita visao nao permitida', () => {
      expect(validarConsultaVisao('visao_secreta')).toBe(false);
    });
  });
});
describe('ataques SQL', () => {
  it.each([
    'SELECT * FROM clientes LIMIT 1; DROP TABLE clientes',
    'SELECT * FROM clientes LIMIT 1 -- comentario',
    'SELECT pg_advisory_lock(1) FROM clientes LIMIT 1',
    'WITH x AS (DELETE FROM clientes RETURNING *) SELECT * FROM x LIMIT 1',
    'SELECT * INTO copia FROM clientes LIMIT 1',
    'SELECT * FROM clientes, pg_catalog.pg_user LIMIT 1',
    'SELECT * FROM clientes LIMIT 1 UNION SELECT * FROM clientes',
    'SELECT * FROM clientes LIMIT 1 FOR UPDATE',
  ])('rejeita %s', (sql) => expect(validarSQL(sql).valido).toBe(false));
});
