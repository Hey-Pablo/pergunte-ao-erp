import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { avaliar } from './avaliacao';
import { gerarSQL } from './gerarSql';
import { executarSQL } from './executar';

async function main() {
  if (!process.env.READER_DATABASE_URL || !process.env.API_KEY || !process.env.MODEL) throw new Error('Configure READER_DATABASE_URL, API_KEY e MODEL.');
  const raiz = resolve(process.cwd(), '..');
  const linhas = readFileSync(resolve(raiz, 'avaliacao/perguntas.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const casos = linhas.map(l => { const separador = l.indexOf(','); return { pergunta: l.slice(0, separador), sql: l.slice(separador + 1) }; });
  const pool = new Pool({ connectionString: process.env.READER_DATABASE_URL });
  try {
    const resultado = await avaliar(casos, async pergunta => {
      const resposta = await gerarSQL(pergunta);
      if (!resposta.confidente) throw new Error('Esclarecimento necessário');
      return resposta.sql;
    }, async sql => {
      const resposta = await executarSQL(pool, sql);
      if (!resposta.sucesso) throw new Error(resposta.erro);
      return resposta.dados || [];
    });
    const data = new Date().toISOString();
    const relatorio = { data, modelo: process.env.MODEL, total: casos.length, taxa: resultado.acertos / casos.length, ...resultado };
    const caminho = resolve(raiz, 'avaliacao/relatorios', `${data.replace(/[:.]/g, '-')}.json`);
    writeFileSync(caminho, JSON.stringify(relatorio, null, 2) + '\n', { flag: 'wx' });
    console.log(`Relatório salvo: ${caminho}`);
  } finally { await pool.end(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
