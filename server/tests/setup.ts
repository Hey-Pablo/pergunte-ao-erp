import fs from 'fs';
import path from 'path';

export async function loadSchemaWithoutPgcrypto(pg: any) {
  // Usar schema simplificado para PGLite (sem FOREIGN KEYS complexas)
  // Quando os testes são rodados da raiz do projeto, CWD é a raiz
  const schemaPath = path.join(process.cwd(), 'server/tests', 'schema-pglite.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  await pg.exec(schema);

  // Carregar seed de dados fictícios
  const seedPath = path.join(process.cwd(), 'db', 'init-scripts', '02_seed.sql');
  const seed = fs.readFileSync(seedPath, 'utf-8');

  await pg.exec(seed);
}