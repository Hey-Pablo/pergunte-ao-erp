import { Router, Request, Response } from 'express';
import { AnthropicBedrock } from '@anthropic-ai/sdk';

export function gerarSqlRouter() {
  const router = Router();

  const client = new AnthropicBedrock({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { pergunta, dicionario } = req.body;

      if (!pergunta || typeof pergunta !== 'string') {
        return res.status(400).json({
          erro: 'Campo "pergunta" e obrigatorio e deve ser string'
        });
      }

      const prompt = `Voce e um assistente que converte perguntas em portuges para consultas SQL seguras.

Pergunta do usuario: ${pergunta}

Tabelas disponiveis: clientes, produtos, fornecedores, filiais, titulos, notas_fiscais, itens_nota, movimentos_estoque
Visoes disponiveis: v_saldo_estoque, v_titulos_vencidos, v_indicadores_faturamento, v_clientes_inadimplentes

Instruces:
1. Gere uma consulta SQL que responda a pergunta
2. A consulta deve ser SELECT apenas
3. Sempre adicione um LIMIT de no maximo 100 resultados
4. Retorne JSON com: sql, explicacao, confidente (boolean), erros (array)

Exemplo de saida:
{"sql": "SELECT ...", "explicacao": "...", "confidente": true, "erros": []}

Resposta:`;

      const sqlGerado = gerarSQLSimples(pergunta);

      res.json({
        pergunta,
        sql: sqlGerado.sql,
        explicacao: sqlGerado.explicacao,
        confidente: sqlGerado.confidente
      });

    } catch (e: any) {
      console.error('Erro ao gerar SQL:', e);
      res.status(500).json({
        erro: 'Erro interno ao gerar SQL',
        mensagem: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
    }
  });

  return router;
}

function gerarSQLSimples(pergunta: string): {
  sql: string;
  explicacao: string;
  confidente: boolean;
} {
  const perguntaLower = pergunta.toLowerCase();

  if (perguntaLower.includes('clientes') && perguntaLower.includes('ativ')) {
    return {
      sql: "SELECT cliente_id, codigo, razao_social, cnpj, email, cidade, estado, ativo FROM clientes WHERE ativo = TRUE LIMIT 50",
      explicacao: "Lista clientes ativos com seus dados de contato",
      confidente: true
    };
  }

  if (perguntaLower.includes('saldo') || perguntaLower.includes('estoque')) {
    return {
      sql: "SELECT codigo, descricao, saldo_atual, estoque_minimo FROM v_saldo_estoque ORDER BY saldo_atual LIMIT 50",
      explicacao: "Mostra o saldo atual de produtos com estoque minimo",
      confidente: true
    };
  }

  if (perguntaLower.includes('titulo') || perguntaLower.includes('conta')) {
    if (perguntaLower.includes('vencido') || perguntaLower.includes('atraso')) {
      return {
        sql: "SELECT codigo, tipo, historico, data_vencimento, valor, status, dias_em_vencimento FROM v_titulos_vencidos WHERE classificacao_vencimento = 'VENCIDO' ORDER BY dias_em_vencimento DESC LIMIT 50",
        explicacao: "Lista titulos vencidos com dias de atraso",
        confidente: true
      };
    }
    return {
      sql: "SELECT titulo_id, codigo, tipo, historico, data_emissao, data_vencimento, valor, status FROM titulos ORDER BY data_vencimento LIMIT 50",
      explicacao: "Lista titulos com status atual",
      confidente: true
    };
  }

  if (perguntaLower.includes('nota') || perguntaLower.includes('faturamento')) {
    return {
      sql: "SELECT numero, serie, data_emissao, valor_total, valor_icms, valor_ipi, cliente_id, filial_id, status FROM notas_fiscais ORDER BY data_emissao DESC LIMIT 50",
      explicacao: "Lista notas fiscais recentes com seus valores",
      confidente: true
    };
  }

  if (perguntaLower.includes('produto')) {
    return {
      sql: "SELECT codigo, descricao, categoria, preco_venda, estoque_minimo, ativo FROM produtos ORDER BY categoria, descricao LIMIT 50",
      explicacao: "Lista produtos com suas categorias e precos",
      confidente: true
    };
  }

  if (perguntaLower.includes('indicador') || perguntaLower.includes('faturamento') || perguntaLower.includes('mes')) {
    return {
      sql: "SELECT mes_ano, quantidade_notas, faturamento_bruto, icms, ipi, clientes_distintos FROM v_indicadores_faturamento ORDER BY mes_ano DESC LIMIT 12",
      explicacao: "Indicadores de faturamento mensal dos ultimos 12 meses",
      confidente: true
    };
  }

  if (perguntaLower.includes('inadimplente') || perguntaLower.includes('em aberto')) {
    return {
      sql: "SELECT codigo, razao_social, cnpj, titulos_em_aberto, valor_em_aberto, ultimo_vencimento FROM v_clientes_inadimplentes ORDER BY valor_em_aberto DESC LIMIT 50",
      explicacao: "Clientes com titulos em aberto, mais inadimplentes primeiro",
      confidente: true
    };
  }

  return {
    sql: "SELECT * FROM clientes LIMIT 10",
    explicacao: "Consulta generica padrao - ajuste necessaria",
    confidente: false
  };
}