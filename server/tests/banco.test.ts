import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');

describe('banco de dados', () => {
  it('schema e carga fictícia inicializam no PostgreSQL', async () => {
    const db = new PGlite();
    try {
      await db.exec(readFileSync(path.join(projectRoot, 'db', 'init-scripts', '01_schema.sql'), 'utf8'));
      await db.exec(readFileSync(path.join(projectRoot, 'db', 'init-scripts', '02_seed.sql'), 'utf8'));
      const resultado = await db.query('SELECT * FROM v_saldo_estoque LIMIT 10');
      expect(resultado.rows.length).toBeGreaterThan(0);
    } finally { await db.close(); }
  }, 60000);
});
