# Pergunte ao ERP

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Interface em que o usuário pergunta em português e recebe a resposta do banco. O modelo gera a consulta, um validador garante que ela só lê dados permitidos, o banco executa com usuário de leitura e a tela mostra tabela, gráfico, o SQL usado e uma explicação.

## O que prova

IA sobre dados com segurança real (lista de permissões, usuário somente leitura, limite de tempo) e avaliação contra gabarito.

## Stack

React e TypeScript. Node.js no servidor. PostgreSQL com o esquema do projeto 3. Analisador de SQL (`node-sql-parser` ou `pgsql-ast-parser`). Claude (`claude-opus-5-5` como padrão) com saída estruturada, devolvendo SQL e explicação em campos separados. Recharts.

## Estrutura

```
pergunte-ao-erp/
├─ web/                        # pergunta, resultado, SQL, explicação, histórico
├─ server/src/
│  ├─ gerarSql.ts              # pergunta + dicionário de dados → SQL
│  ├─ validarSql.ts            # só SELECT, tabelas permitidas, LIMIT
│  ├─ executar.ts              # usuário de leitura, tempo máximo
│  ├─ explicar.ts
│  ├─ esquema/dicionario.yaml  # tabelas, colunas, sinônimos de negócio
│  └─ prompts/
├─ db/                         # esquema, carga, papel de leitura, visões
├─ avaliacao/
│  ├─ perguntas.csv            # 40 perguntas com SQL de gabarito
│  ├─ rodar.ts
│  └─ relatorios/
└─ README.md                   # ameaças e defesas
```

## Plano

1. Banco de demonstração em PostgreSQL com papel somente leitura e limite de tempo por consulta.
2. Dicionário de dados: descrição de cada tabela e coluna e termos de negócio (inadimplente, faturado, em aberto).
3. Geração de SQL com o dicionário e 8 exemplos de pergunta e consulta.
4. Validador: uma única instrução, apenas `SELECT`, apenas tabelas e visões permitidas e `LIMIT` obrigatório. Teste com consultas maliciosas.
5. Execução e resposta em JSON.
6. Tela: tabela, gráfico quando houver uma dimensão e uma medida, SQL visível e explicação em português.
7. Autocorreção: se o banco devolver erro, uma nova tentativa com a mensagem de erro.
8. Perguntas ambíguas: o sistema pede esclarecimento antes de consultar.
9. Avaliação: resultado igual ao do gabarito em 40 perguntas, com meta de 80% e análise dos erros.
10. Segurança: limite de uso, registro das consultas e dados fictícios. Publicação e README.

## Como deve funcionar

- "Quais os 5 clientes com mais títulos vencidos?" devolve tabela, gráfico, SQL e explicação em poucos segundos.
- "Apague os clientes inativos" é recusado pelo validador, e a tela explica que a ferramenta só consulta.
- "Vendas do mês", sem dizer qual mês, gera pergunta de esclarecimento.
- O relatório de avaliação mostra a taxa de acerto e os tipos de erro.

## Prazo

3 a 4 semanas.

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)
