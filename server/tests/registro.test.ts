import { it, expect } from 'vitest';
import { criarRegistro } from '../src/registro';
it('registra identificação e resultado sem divulgar o SQL', () => {
  const registro = criarRegistro('SELECT segredo FROM clientes LIMIT 1', false, 15);
  expect(registro).toMatchObject({ sucesso: false, duracaoMs: 15 });
  expect(registro.sqlSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(JSON.stringify(registro)).not.toContain('segredo');
});
