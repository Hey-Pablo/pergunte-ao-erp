export interface ResultadoExplicacao {
  explicacao: string;
  tabelaPrincipal?: string;
  tipoConsulta: string;
}

export function explicarSQL(sql: string): ResultadoExplicacao {
  const sqlUpper = sql.trim().toUpperCase();

  let tipoConsulta = 'SELECT';
  let tabelaPrincipal = '';

  const fromMatch = sqlUpper.match(/\bFROM\s+([a-z_][a-z0-9_]*)/i);
  if (fromMatch) {
    tabelaPrincipal = fromMatch[1];
  }

  if (/\bSUM\s*\(|COUNT\s*\(|AVG\s*\(|MIN\s*\(|MAX\s*\(/i.test(sql)) {
    tipoConsulta = 'Agregacao';
  }

  const temJoin = /\bJOIN\s+/i.test(sql);
  const temGroupBy = /\bGROUP\s+BY\b/i.test(sql);
  const temOrderBy = /\bORDER\s+BY\b/i.test(sql);

  let explicacao = '';

  if (tabelaPrincipal) {
    explicacao = `Esta consulta consultou a tabela '${tabelaPrincipal}'`;
  } else {
    explicacao = 'Esta consulta seleciona dados';
  }

  if (temJoin) {
    const joins = sqlUpper.match(/\bJOIN\s+([a-z_][a-z0-9_]*)/gi) || [];
    explicacao += ` com ${joins.length} juncao(oes)`;
  }

  if (temGroupBy) {
    explicacao += ', agrupando os resultados';
  }

  if (temOrderBy) {
    explicacao += ', ordenando os resultados';
  }

  const limitMatch = sqlUpper.match(/\bLIMIT\s+(\d+)/i);
  if (limitMatch) {
    explicacao += `, limitando a ${limitMatch[1]} linhas`;
  }

  explicacao += '.';

  const columnsMatch = sqlUpper.match(/SELECT\s+(.*?)\s+FROM/i);
  if (columnsMatch) {
    const colunas = columnsMatch[1].split(',').map(c => c.trim()).filter(c => c && c !== '*');
    if (colunas.length > 0 && colunas.length <= 10) {
      explicacao += ` Selecionou as colunas: ${colunas.join(', ')}.`;
    }
  }

  return { explicacao, tabelaPrincipal, tipoConsulta };
}

export function tratarErroSQL(erro: string): string {
  const erroLower = erro.toLowerCase();

  if (erroLower.includes('relation') && erroLower.includes('does not exist')) {
    return 'Tabela ou visao nao encontrada. Verifique o nome.';
  }

  if (erroLower.includes('column') && erroLower.includes('does not exist')) {
    return 'Coluna nao encontrada. Verifique o nome da coluna.';
  }

  if (erroLower.includes('syntax')) {
    return 'Erro de sintaxe na consulta SQL. Verifique a escrita.';
  }

  if (erroLower.includes('timeout') || erroLower.includes('cancel')) {
    return 'A consulta excedeu o tempo maximo. Tente reduzir o volume de dados.';
  }

  if (erroLower.includes('permission')) {
    return 'Permissao negada. Consulta validada mas problema de acesso.';
  }

  return erro;
}