import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');

export async function loadSchemaWithoutPgcrypto(pg: any) {
  // Usar schema simplificado para PGLite (sem FOREIGN KEYS complexas)
  const schemaPath = path.join(__dirname, 'schema-pglite.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  await pg.exec(schema);

  // Carregar seed de dados fictícios
  const seedPath = path.join(projectRoot, 'db', 'init-scripts', '02_seed.sql');
  const seed = fs.readFileSync(seedPath, 'utf-8');

  await pg.exec(seed);
}