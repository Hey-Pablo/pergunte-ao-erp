import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const pasta = resolve(raiz, 'avaliacao/execucoes');
mkdirSync(pasta, { recursive: true });
const perguntas = readFileSync(resolve(raiz, 'avaliacao/perguntas.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
const dicionario = readFileSync(resolve(raiz, 'server/src/esquema/dicionario.yaml'), 'utf8');
for (let i = 0; i < perguntas.length; i++) {
  const arquivo = resolve(pasta, `${String(i + 1).padStart(3, '0')}.json`);
  if (existsSync(arquivo)) continue;
  const pergunta = perguntas[i].slice(0, perguntas[i].indexOf(','));
  const prompt = `Gere SQL PostgreSQL para a pergunta, usando apenas SELECT e LIMIT. Responda somente o SQL. Dicionário:\n${dicionario}\nPergunta: ${pergunta}`;
  const data = new Date().toISOString();
  const resultado = spawnSync('codex', ['exec', '--skip-git-repo-check', '-m', 'gpt-6.2-sol', prompt], { encoding: 'utf8', timeout: 180000, cwd: raiz });
  const registro = { pergunta, data, modeloSolicitado: 'gpt-6.2-sol', stdout: resultado.stdout, stderr: resultado.stderr, status: resultado.status, erro: resultado.error?.message };
  writeFileSync(arquivo, JSON.stringify(registro, null, 2) + '\n', { flag: 'wx' });
  console.log(`${i + 1}/40: status ${resultado.status}; ${resultado.stderr?.match(/^model:.*$/m)?.[0] || 'modelo não informado'}`);
  if (resultado.status !== 0 || /usage limit|rate limit|limite de uso/i.test(resultado.stderr || '')) { process.exitCode = 1; break; }
}
