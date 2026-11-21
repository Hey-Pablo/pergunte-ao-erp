import { describe, it, expect } from 'vitest';
import { criarLimite } from '../src/limite';

describe('limite de uso', () => {
  it('limita por cliente e libera após a janela', () => {
    let agora = 0;
    const limite = criarLimite(2, 1000, () => agora);
    expect(limite('a')).toBe(true);
    expect(limite('a')).toBe(true);
    expect(limite('a')).toBe(false);
    expect(limite('b')).toBe(true);
    agora = 1000;
    expect(limite('a')).toBe(true);
  });
});
