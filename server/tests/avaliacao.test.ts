import { describe, it, expect } from 'vitest';
import { compararResultados, avaliar } from '../src/avaliacao';

describe('avaliação', () => {
  it('compara linhas sem depender da ordem ou dos nomes das colunas', () => {
    expect(compararResultados([{ x: 1 }, { x: 2 }], [{ n: 2 }, { n: 1 }])).toBe(true);
    expect(compararResultados([{ x: 1 }, { x: 1 }], [{ n: 1 }, { n: 2 }])).toBe(false);
  });
  it('classifica erro de geração e diferença sem inventar acertos', async () => {
    const casos = [{ pergunta: 'a', sql: 'gabarito' }, { pergunta: 'b', sql: 'gabarito' }];
    const gerar = async (p: string) => { if (p === 'a') throw Error('falha'); return 'gerado'; };
    const consultar = async (sql: string) => [{ valor: sql }];
    const resultado = await avaliar(casos, gerar, consultar);
    expect(resultado.acertos).toBe(0);
    expect(resultado.resultados.map(r => r.tipo)).toEqual(['geracao', 'resultado']);
  });
});
