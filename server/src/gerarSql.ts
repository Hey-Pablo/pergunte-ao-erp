import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validarSQL } from './validarSql';
import type { ResultadoExecucao } from './executar';

export interface RespostaGeracaoSQL { sql: string; explicacao: string; confidente: boolean }
type Provedor = (prompt: string) => Promise<string>;

const exemplos = [
  ['Clientes ativos', 'SELECT razao_social FROM clientes WHERE ativo = true LIMIT 100'],
  ['Produtos ativos', 'SELECT descricao FROM produtos WHERE ativo = true LIMIT 100'],
  ['Fornecedores', 'SELECT razao_social FROM fornecedores LIMIT 100'],
  ['Filiais', 'SELECT nome FROM filiais LIMIT 100'],
  ['Títulos vencidos', 'SELECT * FROM v_titulos_vencidos LIMIT 100'],
  ['Saldo de estoque', 'SELECT * FROM v_saldo_estoque LIMIT 100'],
  ['Clientes inadimplentes', 'SELECT * FROM v_clientes_inadimplentes LIMIT 100'],
  ['Faturamento mensal', 'SELECT * FROM v_indicadores_faturamento LIMIT 100'],
];

async function chamarProvedor(prompt: string): Promise<string> {
  const chave = process.env.API_KEY;
  if (!chave) throw new Error('Configure API_KEY para gerar consultas.');
  const base = (process.env.BASE_URL || 'http://localhost:3001/v1').replace(/\/$/, '');
  const resposta = await fetch(`${base}/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chave}` },
    body: JSON.stringify({ model: process.env.MODEL || 'auto', messages: [{ role: 'user', content: prompt }], temperature: 0 }),
    signal: AbortSignal.timeout(30000),
  });
  if (resposta.status === 429) throw Object.assign(new Error('Limite do provedor atingido.'), { code: 'RATE_LIMIT' });
  if (!resposta.ok) throw new Error('Falha no provedor de IA.');
  const corpo: any = await resposta.json();
  return corpo.choices?.[0]?.message?.content;
}

export async function gerarSQL(pergunta: string, erro?: string, provedor: Provedor = chamarProvedor): Promise<RespostaGeracaoSQL> {
  const dicionario = readFileSync(resolve(process.cwd(), 'src/esquema/dicionario.yaml'), 'utf8');
  const prompt = `Converta a pergunta em SQL PostgreSQL de leitura. Retorne somente JSON com sql, explicacao e confidente (boolean). Se faltar informação, retorne confidente=false, sql vazio e pergunta de esclarecimento em explicacao. Use somente SELECT, LIMIT até 100 e tabelas do dicionário.\nDicionário:\n${dicionario}\n${exemplos.map(([p, s], i) => `Exemplo ${i + 1}: ${p}\n${s}`).join('\n')}\nPergunta: ${pergunta}\n${erro ? `A consulta anterior falhou: ${erro}. Corrija uma vez.` : ''}`;
  const resposta: unknown = JSON.parse(await provedor(prompt));
  if (!resposta || typeof resposta !== 'object') throw new Error('Resposta inválida do provedor.');
  const r = resposta as Record<string, unknown>;
  if (typeof r.sql !== 'string' || typeof r.explicacao !== 'string' || typeof r.confidente !== 'boolean' || !r.explicacao.trim() || (r.confidente && !r.sql.trim())) throw new Error('Resposta inválida do provedor.');
  return { sql: r.sql, explicacao: r.explicacao, confidente: r.confidente };
}

export async function consultar(pergunta: string, gerar: typeof gerarSQL, executar: (sql: string) => Promise<ResultadoExecucao>): Promise<RespostaGeracaoSQL & Partial<ResultadoExecucao>> {
  let resposta = await gerar(pergunta);
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    if (!resposta.confidente) return resposta;
    const validacao = validarSQL(resposta.sql);
    if (!validacao.valido) return { ...resposta, sucesso: false, erro: 'Consulta recusada pelo validador.' };
    const resultado = await executar(resposta.sql);
    if (resultado.sucesso || !resultado.erroBanco) return { ...resposta, ...resultado };
    if (tentativa === 1) return { ...resposta, ...resultado, erro: 'Não foi possível executar a consulta.' };
    resposta = await gerar(pergunta, resultado.erro);
  }
  return resposta;
}
