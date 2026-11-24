import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { validarSQL } from '../src/validarSql';

describe('gabaritos SQL', () => {
  it('executa os 40 gabaritos no banco fictício', async () => {
    const banco = new PGlite();
    try {
      await banco.exec(readFileSync('db/init-scripts/01_schema.sql', 'utf8').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', ''));
      await banco.exec(readFileSync('db/init-scripts/02_seed.sql', 'utf8'));
      const linhas = readFileSync('avaliacao/perguntas.csv', 'utf8').trim().split(/\r?\n/).slice(1);
      expect(linhas).toHaveLength(40);
      for (const linha of linhas) {
        const sql = linha.slice(linha.indexOf(',') + 1);
        expect(validarSQL(sql), sql).toMatchObject({ valido: true });
        await banco.query(sql);
      }
    } finally { await banco.close(); }
  }, 30000);
});
