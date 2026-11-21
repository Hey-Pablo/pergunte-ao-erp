import type {
  GerarSqlResponse,
  ValidarSqlResponse,
  ExecutarResponse,
  VisoesResponse,
  VisaoSchema,
  HealthResponse,
} from './types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.erro || 'Erro na requisição') as Error & { response?: Response; data?: any };
    error.response = response;
    error.data = data;
    throw error;
  }

  return data;
}

export async function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function gerarSql(pergunta: string): Promise<GerarSqlResponse> {
  return request<GerarSqlResponse>('/gerar-sql', {
    method: 'POST',
    body: JSON.stringify({ pergunta }),
  });
}

export async function validarSql(sql: string): Promise<ValidarSqlResponse> {
  return request<ValidarSqlResponse>('/validar-sql', {
    method: 'POST',
    body: JSON.stringify({ sql }),
  });
}

export async function executarSql(sql: string, limite?: number): Promise<ExecutarResponse> {
  return request<ExecutarResponse>('/executar', {
    method: 'POST',
    body: JSON.stringify({ sql, limite }),
  });
}

export async function getVisoes(): Promise<VisoesResponse> {
  return request<VisoesResponse>('/executar/visoes');
}

export async function getVisaoSchema(nome: string): Promise<VisaoSchema> {
  return request<VisaoSchema>(`/executar/visao/${encodeURIComponent(nome)}`);
}

export async function getTabelasPermitidas(): Promise<{ tabelas: string[] }> {
  return request<{ tabelas: string[] }>('/validar-sql/tabelas');
}