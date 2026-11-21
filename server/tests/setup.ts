import fs from 'fs';
import path from 'path';

export async function loadSchemaWithoutPgcrypto(pg: any) {
  // Usar schema simplificado para PGLite (sem FOREIGN KEYS complexas)
  const schemaPath = path.join(process.cwd(), 'tests', 'schema-pglite.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  await pg.exec(schema);

  // Carregar seed de dados fictícios (caminho relativo do projeto raiz)
  const seedPath = path.join(process.cwd(), '..', 'db', 'init-scripts', '02_seed.sql');
  let seed = fs.readFileSync(seedPath, 'utf-8');

  await pg.exec(seed);
}