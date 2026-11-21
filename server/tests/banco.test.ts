import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('schema e carga fictícia inicializam no PostgreSQL', async () => {
  const db = new PGlite();
  try {
    await db.exec(readFileSync('../db/init-scripts/01_schema.sql', 'utf8'));
    await db.exec(readFileSync('../db/init-scripts/02_seed.sql', 'utf8'));
    const resultado = await db.query('SELECT * FROM v_saldo_estoque LIMIT 10');
    expect(resultado.rows.length).toBeGreaterThan(0);
  } finally { await db.close(); }
}, 60000);
