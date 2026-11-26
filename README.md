# Pergunte ao ERP

> **Demonstração:** em breve
> 
> **Status:** CI configurado — testes do server e web passando

## O que é

Interface em que o usuário pergunta em português e recebe a resposta do banco. O modelo gera a consulta, um validador garante que ela só lê dados permitidos, o banco executa com usuário de leitura e a tela mostra tabela, gráfico, o SQL usado e uma explicação.

## O que prova

IA sobre dados com segurança real (lista de permissões, usuário somente leitura, limite de tempo) e avaliação contra gabarito.

## Stack

React, TypeScript, Vite. Node.js/Express no servidor. PostgreSQL com esquema de ERP fictício. Recharts para visualizacao. node-sql-parser para validacao de SQL.

## Estrutura

```
pergunte-ao-erp/
├─ web/                        # Interface React
│  ├─ src/
│  │  ├─ components/          # PerguntaForm, Resultado
│  │  ├─ pages/               # Paginas principais
│  │  ├─ lib/                 # Tipos e utilitarios
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  └─ index.css
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.ts
├─ server/src/
│  ├─ routes/
│  │  ├─ gerarSql.ts          # Genera SQL da pergunta
│  │  ├─ validarSql.ts        # Valida SQL
│  │  └─ executar.ts          # Executa com usuario de leitura
│  ├─ gerarSql.ts              # Configuracao do cliente
│  ├─ validarSql.ts            # Validador principal
│  ├─ executar.ts              # Executor com timeout
│  ├─ explicar.ts            # Explica resultados
│  ├─ esquema/dicionario.yaml  # Dicionario de dados
│  ├─ prompts/gerar_sql.md     # Prompt para IA
│  ├─ app.ts                   # Middleware Express
│  ├─ server.ts
│  └─ index.ts               # Entrada principal
├─ db/
│  └─ init-scripts/
│     ├─ 01_schema.sql        # Schema do banco
│     ├─ 02_seed.sql          # Dados de exemplo
│     └─ 03_reader_user.sql   # Usuario de leitura
├─ tests/
│  └─ validarSql.test.ts     # Testes do validador
├─ web/src/lib/
│  └─ utils.test.ts          # 24 testes de utilitários
└─ web/vitest.config.ts      # Configuração de testes Web
├─ server/Dockerfile
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Segurança

### Ameaças e Defesas

| Ameaca | Defesa |
|--------|--------|
| Execucao de consultas maliciosas | Validador estrito que rejeita INSERT/UPDATE/DELETE |
| Exposicao de dados sensiveis | Usuario de leitura somente, sem CREATE/DROP |
| Consultas lentas | Timeout de 30 segundos por consulta |
| Excesso de resultados | Limite maximo de 10.000 registros |
| SQL injection | Validacao de tabelas e colunas permitidas |

### Permissoes do Usuario de Leitura

- `SELECT` em todas as tabelas e vistas
- `statement_timeout = 30s`
- Sem permissoes DDL ou utilitarios

## Instalacao Local

### Requisitos

- Node.js 20+
- PostgreSQL 16+
- Docker (opcional)

### Executar com Docker

```bash
# Copiar .env.example para .env e configurar senhas
cp .env.example .env

# Subir servicos
docker-compose up -d

# Executar scripts de inicializacao manualmente (se necessario)
docker-compose exec db psql -U pergunte_user -d pergunte_erp -f /docker-entrypoint-initdb.d/01_schema.sql
docker-compose exec db psql -U pergunte_user -d pergunte_erp -f /docker-entrypoint-initdb.d/02_seed.sql
docker-compose exec db psql -U postgres -d pergunte_erp -f /docker-entrypoint-initdb.d/03_reader_user.sql
```

### Executar localmente

```bash
# Banco de dados
docker run -d -p 5432:5432 --name pg-pergunte \
  -e POSTGRES_USER=pergunte_user \
  -e POSTGRES_PASSWORD=senha \
  -e POSTGRES_DB=pergunte_erp \
  postgres:16-alpine

# Inicializar schema
# ... (rodar scripts SQL)

# Servidor
cd server
npm install
npm run dev

# Frontend
cd web
npm install
npm run dev
```

## Tabelas e Visoes Disponiveis

### Tabelas Principais

| Tabela | Descricao |
|--------|-----------|
| `clientes` | Cadastro de clientes |
| `produtos` | Cadastro de produtos |
| `fornecedores` | Cadastro de fornecedores |
| `filiais` | Filiais da empresa |
| `titulos` | Contas a pagar/receber |
| `parcelas` | Parcelas de titulos |
| `notas_fiscais` | Notas fiscais |
| `itens_nota` | Itens de notas fiscais |
| `movimentos_estoque` | Entradas e saidas de estoque |

### Visoes Prontas

| Visao | Uso |
|-------|-----|
| `v_saldo_estoque` | Saldo atual de produtos |
| `v_titulos_vencidos` | Titulos com datas de vencimento |
| `v_indicadores_faturamento` | Faturamento mensal |
| `v_clientes_inadimplentes` | Clientes com titulos em aberto |

## Exemplos de Consultas

| Pergunta | SQL Gerado |
|----------|------------|
| "Quais os 5 clientes com mais titulos vencidos?" | SELECT dos titulos com ordenacao por valor |
| "Saldo de estoque de todos os produtos" | SELECT de v_saldo_estoque |
| "Total de titulos em aberto por cliente" | SELECT com agregacao |
| "Faturamento do mes atual" | SELECT de v_indicadores_faturamento |

## Testes

```bash
# Testes do servidor
cd server
npm test
# 12 testes passando (validarSql)

# Testes do frontend
cd web
npm test
# 24 testes passando (utils)
# Total: 36 testes passando
```

## API

### Endpoints

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/gerar-sql | Gera SQL a partir de pergunta |
| POST | /api/validar-sql | Valida uma consulta SQL |
| POST | /api/executar | Executa consulta validada |
| GET | /api/executar/visoes | Lista visoes disponiveis |
| GET | /api/executar/visao/:nome | Schema de uma visao |
| GET | /api/health | Health check |

## Limite de Resultados

Por seguranca, consultas sao limitadas a 10.000 registros por padrao. O limite pode ser ajustado para consultas especificas com parametro `limite`.

## Historico de Alteracoes

- 2026-11-21: Estrutura inicial com docker-compose, schema SQL, API REST e frontend React

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)
