import { Pool } from 'pg';
import { AnthropicBedrock } from '@anthropic-ai/sdk';

// Configuracao do banco de leitura
export function criarPoolLeitura(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

// Pool separado para queries com timeout mais curto
export function criarPoolLeituraRestrito(): Pool {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 3000,
    statement_timeout: 30000, // 30 segundos max
  });
  return pool;
}

// Cliente Claude
export function criarClienteClaude() {
  return new AnthropicBedrock({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

// Tipo para a resposta do gerador
export interface RespostaGeracaoSQL {
  sql: string;
  explicacao: string;
  confidente: boolean;
  erros?: string[];
}