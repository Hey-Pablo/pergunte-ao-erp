# Pergunte ao ERP

> **Demonstração:** em breve

## O que é

Interface em que o usuário pergunta em português e recebe a resposta do banco. O modelo gera a consulta, um validador garante que ela só lê dados permitidos, o banco executa com usuário de leitura e a tela mostra tabela, gráfico, o SQL usado e uma explicação.

## O que prova

IA sobre dados com segurança real (lista de permissões, usuário somente leitura, limite de tempo) e avaliação contra gabarito.

## Stack

React, TypeScript, Vite. Node.js/Express no servidor. PostgreSQL com esquema de ERP fictício. Recharts para visualizacao. node-sql-parser para validacao de SQL. @electric-sql/pglite para testes.

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
├─ server/tests/
│  ├─ reader-role.test.ts    # Testes de segurança e dicionario
│  ├─ schema-pglite.sql      # Schema para testes PGLite
│  ├─ setup.ts               # Setup de testes
│  └─ validarSql.test.ts     # Testes do validador SQL
├─ db/
│  └─ init-scripts/
│     ├─ 01_schema.sql        # Schema do banco
│     ├─ 02_seed.sql          # Dados de exemplo
│     └─ 03_reader_user.sql   # Usuario de leitura
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Configurar sua chave

Cada usuário usa sua própria chave de um provedor compatível com a API OpenAI. Para FreeLLMAPI, siga a [documentação de instalação](https://github.com/emmgmm/FreeLLMAPI/blob/main/docs/en/install/01-install.md), configure suas chaves de provedores no painel e obtenha a chave unificada na página Keys. Copie `.env.example` para `.env`, configure `BASE_URL`, `API_KEY` e `MODEL` e mantenha `.env` fora do Git. O endereço padrão aponta para uma instalação local em `http://localhost:3001/v1`; é necessário iniciar e configurar esse serviço separadamente. Nenhuma chave real é necessária nos testes.

## Avaliação

O arquivo `avaliacao/perguntas.csv` contém 40 perguntas e consultas de referência para o banco fictício. Com o banco local inicializado, o papel `reader_user` configurado e o provedor disponível, execute a partir de `server/`:

```bash
set -a; source ../.env; set +a
npx tsx ../avaliacao/rodar.ts
```

O relatório JSON em `avaliacao/relatorios/` registra data, modelo, taxa de acerto e erros de geração, execução ou resultado. Uma falha de gabarito interrompe a execução. A comparação ignora a ordem das linhas e nomes das colunas, mas preserva duplicatas e ordem dos valores de cada linha. A taxa só aparece após uma execução real; a meta é 80%. Os dados e relatórios devem ser fictícios e revisados antes de publicar. No PC, rode também PostgreSQL e provedor reais para validar permissões, timeout, conexão e execução completa; os testes automatizados usam PGlite e mocks.

A avaliação registrada pelo Codex usa uma chamada por pergunta com o dicionário, sem os exemplos e a autocorreção do servidor. As saídas brutas ficam em `avaliacao/execucoes/`; o relatório é gerado com `cd server && npx tsx src/relatorioCodex.ts`. Essa medição não representa o fluxo completo da API. Em 21/11/2026, a reavaliação das mesmas 40 saídas após corrigir o validador obteve **33/40 (82,5%)**: sete consultas foram recusadas por falta de `LIMIT` numérico. O [relatório detalhado](avaliacao/relatorios/codex-2026-11-21T21-57-09-282Z.json) preserva os resultados; a [análise anterior](avaliacao/relatorios/analise-2026-11-21.md) mantém o histórico de 0/40.

O servidor limita requisições POST a 30 por IP por minuto, em memória por processo. Esse limite reinicia com o servidor e não é compartilhado entre instâncias; produção exige limite compartilhado e autenticação. Cada execução de SQL registra data, duração, resultado e hash SHA-256 do SQL no console, sem registrar o texto nem os resultados. O operador deve definir retenção e proteger os logs; hash não impede adivinhação de consultas conhecidas.

## Segurança

### Ameaças e Defesas

| Ameaca | Defesa |
|--------|--------|
| Execucao de consultas maliciosas | Validador estrito que rejeita INSERT/UPDATE/DELETE |
| Exposicao de dados sensiveis | Usuario de leitura somente, sem CREATE/DROP |
| Consultas lentas | Timeout de 30 segundos por consulta |
| Excesso de resultados | Limite maximo de 10.000 registros |
| SQL gerado malicioso | Validador SQL e papel de leitura; revise permissões do banco antes de expor a API |
| Abuso da API | Limite local por IP; autenticação e limite compartilhado são necessários em produção |
| Vazamento por logs | SQL e resultados não são registrados em texto; logs requerem proteção e retenção |
| Pergunta maliciosa ao modelo | Saída é validada antes da execução; o modelo não é uma fronteira de segurança |

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
# Testes do validador SQL
cd server
npm test
```

### Testes de Segurança do Banco

O diretório `server/tests/` contém testes de segurança que verificam:

- **Reader Role**: Apenas consultas SELECT são permitidas; INSERT, UPDATE, DELETE são rejeitados pelo validador SQL
- **Cobertura do Dicionário**: Todas as tabelas, visões e colunas do dicionário existem no banco
- **Execução de Consultas**: Consultas SELECT válidas com LIMIT, JOINs e agregações funcionam corretamente

Os testes usam `@electric-sql/pglite` para executar tests sem precisar de PostgreSQL real.

## Banco de Demonstração

O banco de demonstração usa:

- **Schema**: 14 tabelas principais + 4 visões analíticas
- **Dados**: 500+ registros fictícios (clientes, produtos, notas fiscais, títulos)
- **Usuário de Leitura**: `reader_user` com permissões SELECT apenas, timeout de 30s

### Tabelas Principais

| Tabela | Descrição | Registros |
|--------|-----------|-----------|
| `clientes` | Cadastro de clientes | 12 clientes |
| `produtos` | Cadastro de produtos | 20 produtos |
| `fornecedores` | Cadastro de fornecedores | 10 fornecedores |
| `filiais` | Filiais da empresa | 5 filiais |
| `titulos` | Contas a pagar/receber | 10 títulos |
| `parcelas` | Parcelas de títulos | 13 parcelas |
| `notas_fiscais` | Notas fiscais | 10 notas |
| `itens_nota` | Itens de notas | 16 itens |
| `movimentos_estoque` | Entradas/saídas de estoque | 22 movimentos |

### Visões Analíticas

| Visão | Descrição | Uso |
|-------|-----------|-----|
| `v_saldo_estoque` | Saldo atual de produtos ativos | Monitorar estoque |
| `v_titulos_vencidos` | Títulos com vencimento | Controle de prazos |
| `v_indicadores_faturamento` | Faturamento mensal | Análise financeira |
| `v_clientes_inadimplentes` | Clientes com titulos em aberto | Análise de risco |

### Executar Localmente

```bash
# Requisitos: Docker e Docker Compose

# 1. Copiar .env.example para .env
cp .env.example .env

# 2. Subir o banco PostgreSQL
docker-compose up -d db

# 3. Executar os scripts de inicialização
docker-compose exec db psql -U pergunte_user -d pergunte_erp -f /docker-entrypoint-initdb.d/01_schema.sql
docker-compose exec db psql -U pergunte_user -d pergunte_erp -f /docker-entrypoint-initdb.d/02_seed.sql
docker-compose exec db psql -U postgres -d pergunte_erp -f /docker-entrypoint-initdb.d/03_reader_user.sql

# 4. (Opcional) Iniciar a API
docker-compose up -d api
```

### Configuração do .env

```bash
# Database connection
POSTGRES_USER=pergunte_user
POSTGRES_PASSWORD=sua_senha_aqui
POSTGRES_DB=pergunte_erp
DATABASE_URL=postgresql://pergunte_user:sua_senha_aqui@localhost:5432/pergunte_erp

# Reader user (for future use)
READER_USER=reader_user
READER_PASSWORD=sua_senha_reader_aqui
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
