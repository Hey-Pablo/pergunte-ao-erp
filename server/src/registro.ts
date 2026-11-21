import { createHash } from 'node:crypto';
export function criarRegistro(sql: string, sucesso: boolean, duracaoMs: number) {
  return { evento: 'consulta', data: new Date().toISOString(), sqlSha256: createHash('sha256').update(sql).digest('hex'), sucesso, duracaoMs };
}
