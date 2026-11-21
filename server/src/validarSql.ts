// Tabelas permitidas para consultas
const TABELAS_PERMITIDAS = [
  'clientes', 'produtos', 'fornecedores', 'filiais', 'titulos',
  'notas_fiscais', 'itens_nota', 'movimentos_estoque',
  'v_saldo_estoque', 'v_titulos_vencidos',
  'v_indicadores_faturamento', 'v_clientes_inadimplentes'
];

// Colunas permitidas por tabela
const colunasPermitidas: Record<string, string[]> = {
  clientes: ['cliente_id', 'codigo', 'razao_social', 'nome_fantasia', 'cnpj', 'email', 'telefone', 'endereco', 'cidade', 'estado', 'cep', 'ativo', 'data_cadastro'],
  produtos: ['produto_id', 'codigo', 'descricao', 'ncm', 'categoria', 'preco_custo', 'preco_venda', 'unidade_medida', 'estoque_minimo', 'ativo'],
  fornecedores: ['fornecedor_id', 'codigo', 'razao_social', 'cnpj', 'email', 'telefone', 'endereco', 'ativo'],
  filiais: ['filial_id', 'codigo', 'nome', 'endereco', 'cidade', 'estado', 'ativa'],
  titulos: ['titulo_id', 'codigo', 'tipo', 'historico', 'data_emissao', 'data_vencimento', 'valor', 'cliente_fornecedor_id', 'produto_id', 'filial_id', 'status'],
  notas_fiscais: ['nota_id', 'numero', 'serie', 'data_emissao', 'data_entrada', 'valor_total', 'valor_icms', 'valor_ipi', 'valor_inss', 'cliente_id', 'filial_id', 'chave_acesso', 'status'],
  itens_nota: ['item_id', 'nota_id', 'produto_id', 'quantidade', 'valor_unitario', 'valor_desconto', 'quantidade_embalagem', 'codigo_produto'],
  movimentos_estoque: ['movimento_id', 'produto_id', 'tipo', 'quantidade', 'preco_custo', 'data_movimento', 'motivo', 'usuario_id'],
  v_saldo_estoque: ['produto_id', 'codigo', 'descricao', 'saldo_atual', 'estoque_minimo'],
  v_titulos_vencidos: ['titulo_id', 'codigo', 'tipo', 'historico', 'data_vencimento', 'valor', 'status', 'dias_em_vencimento', 'classificacao_vencimento'],
  v_indicadores_faturamento: ['mes_ano', 'quantidade_notas', 'faturamento_bruto', 'icms', 'ipi', 'clientes_distintos'],
  v_clientes_inadimplentes: ['cliente_id', 'codigo', 'razao_social', 'cnpj', 'total_titulos', 'titulos_em_aberto', 'valor_em_aberto', 'ultimo_vencimento']
];

export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
  sql_corrigido?: string;
}

export function validarSQL(sql: string): ResultadoValidacao {
  const erros: string[] = [];
  const sqlUpper = sql.trim().toUpperCase();

  if (!sqlUpper.startsWith('SELECT')) {
    erros.push('Apenas consultas SELECT sao permitidas');
    return { valido: false, erros };
  }

  const operacoesProibidas = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'EXEC', 'EXECUTE', 'RUN'];
  for (const op of operacoesProibidas) {
    if (sqlUpper.includes(op)) {
      erros.push(`Operacao '${op}' nao permitida`);
    }
  }

  const pontoEComa = (sql.match(/;/g) || []).length;
  if (pontoEComa > 1) {
    erros.push('A consulta deve conter apenas uma unica instrucao SQL');
  }

  if (sqlUpper.includes('PG_SLEEP') || sqlUpper.includes('DANDOM') || sqlUpper.includes('COPY FROM')) {
    erros.push('Funcao potencialmente perigosa detectada');
  }

  const tabelaRegex = /\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/gi;
  const tabelas = new Set<string>();
  let match;
  while ((match = tabelaRegex.exec(sql)) !== null) {
    const tabela = match[1].toLowerCase();
    tabelas.add(tabela);
  }

  for (const tabela of tabelas) {
    if (!TABELAS_PERMITIDAS.includes(tabela)) {
      erros.push(`Tabela '${tabela}' nao esta na lista de tabelas permitidas`);
    }
  }

  if (!/\bLIMIT\s+\d+/i.test(sql)) {
    erros.push('Consulta deve ter LIMIT para limitar resultados');
  }

  const limitMatch = sql.match(/\bLIMIT\s+(\d+)/i);
  if (limitMatch && parseInt(limitMatch[1]) > 10000) {
    erros.push('LIMIT maximo é 10000 registros');
  }

  return { valido: erros.length === 0, erros };
}

export function validarConsultaVisao(nomeVisao: string): boolean {
  return TABELAS_PERMITIDAS.includes(nomeVisao);
}

export function getTabelasPermitidas(): string[] {
  return [...TABELAS_PERMITIDAS];
}

export function getColunasPermitidas(tabela: string): string[] {
  return colunasPermitidas[tabela] || [];
}