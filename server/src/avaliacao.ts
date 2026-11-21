export interface Caso { pergunta: string; sql: string }
type Linha = Record<string, unknown>;
export function compararResultados(a: Linha[], b: Linha[]): boolean {
  const normalizar = (linhas: Linha[]) => linhas.map(l => JSON.stringify(Object.values(l))).sort();
  return JSON.stringify(normalizar(a)) === JSON.stringify(normalizar(b));
}
export async function avaliar(casos: Caso[], gerar: (p: string) => Promise<string>, consultar: (sql: string) => Promise<Linha[]>) {
  const resultados: Array<{ pergunta: string; tipo: string; sql?: string }> = [];
  for (const caso of casos) {
    let esperado: Linha[];
    try { esperado = await consultar(caso.sql); } catch { throw new Error(`Falha no gabarito: ${caso.pergunta}`); }
    let sql: string;
    try { sql = await gerar(caso.pergunta); } catch { resultados.push({ pergunta: caso.pergunta, tipo: 'geracao' }); continue; }
    try {
      const obtido = await consultar(sql);
      resultados.push({ pergunta: caso.pergunta, sql, tipo: compararResultados(esperado, obtido) ? 'acerto' : 'resultado' });
    } catch { resultados.push({ pergunta: caso.pergunta, sql, tipo: 'execucao' }); }
  }
  return { acertos: resultados.filter(r => r.tipo === 'acerto').length, resultados };
}
