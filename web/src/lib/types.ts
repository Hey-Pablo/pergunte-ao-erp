export interface GerarSqlResponse {
  pergunta?: string;
  dados?: any[];
  colunas?: string[];
  total_resultados?: number;
  tempo_execucao_ms?: number;
  sucesso?: boolean;
  sql: string;
  explicacao: string;
  confidente: boolean;
  erro?: string;
  tabelaPrincipal?: string;
  tipoConsulta?: string;
}

export interface ExecutarResponse {
  dados?: any[];
  colunas?: string[];
  total_resultados?: number;
  tempo_execucao_ms?: number;
  erro?: string;
  detalhes?: string[];
  timeout?: boolean;
}

export interface ValidarSqlResponse {
  valido: boolean;
  erros: string[];
  sql?: string;
  explicacao?: string;
  pergunta?: string;
  erro?: string;
  timeout?: boolean;
}

export interface VisaoSchema {
  nome: string;
  colunas: string[];
}

export interface VisaoDisponivel {
  nome: string;
  descricao: string;
  colunas: string[];
}

export interface VisoesResponse {
  visoes: VisaoDisponivel[];
}

export interface HealthResponse {
  status: string;
  servico: string;
}

export interface HistoryItem {
  id: string;
  pergunta: string;
  sql: string;
  explicacao: string;
  timestamp: number;
  sucesso: boolean;
  totalResultados?: number;
  erro?: string;
}

export interface ApiError {
  erro: string;
  mensagem?: string;
  detalhes?: string[];
}

export type LoadingState = 'idle' | 'gerando-sql' | 'validando' | 'executando';

export interface ColumnInfo {
  name: string;
  type: string;
  isNumeric: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}