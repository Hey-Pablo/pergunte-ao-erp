import { Parser } from 'node-sql-parser';

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
};

export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
  sql_corrigido?: string;
}

export function validarSQL(sql: string): ResultadoValidacao {
  const erros: string[] = [];
  if (!sql.trim().toUpperCase().startsWith('SELECT')) {
    return { valido: false, erros: ['Apenas consultas SELECT sao permitidas'] };
  }
  if (/--|\/\*|\*\//.test(sql)) return { valido: false, erros: ['Comentarios nao permitidos'] };
  try {
    const ast: any = new Parser().astify(sql, { database: 'Postgresql' });
    if (Array.isArray(ast) || ast.type !== 'select' || ast.with || ast._next || ast.into?.position || ast.locking_read) {
      return { valido: false, erros: ['Apenas uma consulta SELECT simples e permitida'] };
    }
    const limit = ast.limit?.value;
    if (!limit || limit.length !== 1 || limit[0].type !== 'number' || !Number.isInteger(limit[0].value)) {
      erros.push('Consulta deve ter LIMIT para limitar resultados');
    } else if (limit[0].value < 1 || limit[0].value > 10000) {
      erros.push('LIMIT maximo é 10000 registros');
    }
    const funcoes = new Set(['count', 'sum', 'avg', 'min', 'max', 'coalesce', 'round', 'date_trunc', 'extract', 'lower', 'upper']);
    const visitar = (node: any): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(visitar); return; }
      if (node !== ast && node.type === 'select') erros.push('Subconsultas nao permitidas');
      if (node.type === 'function' || node.type === 'aggr_func') {
        const nome = typeof node.name === 'string' ? node.name : node.name?.name?.map((n: any) => n.value).join('.');
        if (!nome || !funcoes.has(nome.toLowerCase())) erros.push('Funcao nao permitida');
      }
      Object.values(node).forEach(visitar);
    };
    visitar(ast);
    for (const fonte of ast.from || []) {
      if (fonte.db || typeof fonte.table !== 'string' || !TABELAS_PERMITIDAS.includes(fonte.table)) {
        erros.push(`Tabela '${fonte.table || ''}' nao esta na lista de tabelas permitidas`);
      }
    }
  } catch {
    erros.push('SQL invalido ou nao suportado');
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