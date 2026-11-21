import { Pool } from 'pg';

export function criarPoolLeitura(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export function criarPoolLeituraRestrito(): Pool {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 3000,
    statement_timeout: 30000,
  });
  return pool;
}

export interface RespostaGeracaoSQL {
  sql: string;
  explicacao: string;
  confidente: boolean;
  erros?: string[];
}