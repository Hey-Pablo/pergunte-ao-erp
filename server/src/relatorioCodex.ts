import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { validarSQL } from './validarSql';
import { compararResultados } from './avaliacao';

async function main() {
  const raiz = resolve(process.cwd(), '..');
  const dir = resolve(raiz, 'avaliacao/execucoes');
  const arquivos = readdirSync(dir).filter(f => /^\d{3}\.json$/.test(f)).sort();
  const linhas = readFileSync(resolve(raiz, 'avaliacao/perguntas.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const banco = new PGlite();
  const resultados: Array<Record<string, unknown>> = [];
  try {
    await banco.exec(readFileSync(resolve(raiz, 'db/init-scripts/01_schema.sql'), 'utf8').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', ''));
    await banco.exec(readFileSync(resolve(raiz, 'db/init-scripts/02_seed.sql'), 'utf8'));
    for (const arquivo of arquivos) {
      const indice = Number(arquivo.slice(0, 3)) - 1;
      const caso = linhas[indice];
      const registro = JSON.parse(readFileSync(resolve(dir, arquivo), 'utf8'));
      if (!caso || registro.pergunta !== caso.slice(0, caso.indexOf(','))) throw new Error(`Entrada incompatível: ${arquivo}`);
      const sql = registro.stdout.trim().replace(/^```(?:sql)?\s*/i, '').replace(/\s*```$/, '');
      const modelo = registro.stderr.match(/^model: (.+)$/m)?.[1] || null;
      let tipo = 'geracao';
      let detalhes: string[] = [];
      if (registro.status === 0 && sql) {
        const validacao = validarSQL(sql);
        if (!validacao.valido) { tipo = 'validacao'; detalhes = validacao.erros; }
        else {
          const gabarito = await banco.query(caso.slice(caso.indexOf(',') + 1));
          try {
            const obtido = await banco.query(sql);
            tipo = compararResultados(gabarito.rows as Record<string, unknown>[], obtido.rows as Record<string, unknown>[]) ? 'acerto' : 'resultado';
          } catch { tipo = 'execucao'; }
        }
      }
      resultados.push({ pergunta: registro.pergunta, data: registro.data, modelo, sql, tipo, detalhes });
    }
    const acertos = resultados.filter(r => r.tipo === 'acerto').length;
    const data = new Date().toISOString();
    const relatorio = { data, ambiente: 'PGlite com dados fictícios', totalPrevisto: linhas.length, totalExecutado: resultados.length, acertos, taxa: resultados.length ? acertos / resultados.length : null, resultados };
    const destino = resolve(raiz, 'avaliacao/relatorios', `codex-${data.replace(/[:.]/g, '-')}.json`);
    writeFileSync(destino, JSON.stringify(relatorio, null, 2) + '\n', { flag: 'wx' });
    console.log(`Relatório: ${destino}; ${acertos}/${resultados.length} acertos.`);
  } finally { await banco.close(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
