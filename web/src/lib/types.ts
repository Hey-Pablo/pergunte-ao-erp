export interface Pergunta {
  texto: string;
}

export interface ResultadoConsulta {
  sucesso: boolean;
  dados?: any[];
  colunas?: string[];
  tempo_execucao_ms: number;
  total_resultados: number;
  sql?: string;
  explicacao?: string;
  pergunta?: string;
  erro?: string;
  timeout?: boolean;
}

export interface ColunaResultado {
  nome: string;
  tipo?: string;
}

export interface VisaoInfo {
  nome: string;
  descricao: string;
  colunas: string[];
}

export interface TabelaInfo {
  nome: string;
}