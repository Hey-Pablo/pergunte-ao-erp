# Pergunte ao ERP

> **Demonstração:** em breve

Aplicação de portfólio para consultar um ERP fictício em português. O servidor pede SQL e explicação a um modelo, valida a consulta e executa em PostgreSQL com papel de leitura. Se faltar informação, o modelo pede esclarecimento; após erro do banco, tenta corrigir uma vez. A avaliação de qualidade das respostas e o limite de uso ainda não foram implementados.

## Requisitos

- Node.js 20+ e npm.
- PostgreSQL 16 em banco exclusivo de demonstração, com dados fictícios.
- FreeLLMAPI local ou outro provedor compatível com a API de chat da OpenAI.

## Configurar sua chave

Instale e configure o [FreeLLMAPI](https://github.com/emmgmm/FreeLLMAPI) ou outro provedor compatível. No FreeLLMAPI, crie sua própria chave unificada no painel e configure os provedores que deseja usar. Copie `.env.example` para `.env` na raiz e preencha `BASE_URL`, `API_KEY` e `MODEL`. O padrão aponta para `http://localhost:3001/v1`, modelo `auto`. Confira limites e custos do provedor escolhido. A chave fica no servidor e não deve ser enviada ao repositório.

## Preparar o banco

Crie um banco PostgreSQL vazio `pergunte_erp` e execute, como proprietário, nesta ordem:

```bash
psql -v ON_ERROR_STOP=1 -d pergunte_erp -f db/init-scripts/01_schema.sql
psql -v ON_ERROR_STOP=1 -d pergunte_erp -f db/init-scripts/02_seed.sql
psql -v ON_ERROR_STOP=1 -d pergunte_erp -f db/init-scripts/03_reader_user.sql
psql -d pergunte_erp -c '\password reader_user'
```

Defina uma senha própria no prompt do `psql`. Configure `READER_DATABASE_URL` no `.env` com essa senha. O papel precisa ser `reader_user`, sem associação a outros papéis ou privilégios elevados. Use um banco dedicado: o script revoga `CREATE` público no schema. Não use credenciais administrativas na aplicação. Em instalações existentes, revise privilégios herdados, propriedade das tabelas e permissões concedidas a `PUBLIC` antes de usar.

## Executar

```bash
cd server
npm ci --ignore-scripts
npm run dev
```

Em outro terminal:

```bash
cd web
npm ci --ignore-scripts
npm run dev
```

Abra `http://localhost:5173`. A API local usa a porta 3002 e o proxy de desenvolvimento encaminha `/api`. O projeto é uma demonstração local: autenticação, limitação de uso e proteção para exposição pública ainda precisam ser implementadas.

## Segurança e limitações

Perguntas e respostas do modelo são entradas não confiáveis. O analisador aceita uma instrução `SELECT`, tabelas autorizadas, funções autorizadas e `LIMIT` inteiro de 1 a 10000. Comentários, CTEs, subconsultas, uniões e `SELECT INTO` são recusados. O executor confirma o papel `reader_user`, inicia transação somente leitura e define `statement_timeout` de 30 segundos. Essas camadas dependem também de permissões corretas no PostgreSQL; não substituem revisão de segurança antes de publicar. A geração envia pergunta e dicionário fictício ao provedor; não envie dados reais ou segredos na pergunta.

`POST /api/gerar-sql` recebe `{ "pergunta": "..." }` e retorna SQL, explicação e resultados ou esclarecimento. `POST /api/validar-sql` e `POST /api/executar` oferecem validação e execução separadas. O executor valida novamente antes da consulta.

## Testes

```bash
cd server
npm test
npm run build
npm audit --omit=dev
cd ../web
npm ci --ignore-scripts
npm run build
```

Os testes usam PGlite para esquema, carga e execução e um provedor simulado. No PC, Pablo precisa testar com PostgreSQL real: criar banco e papel, conferir que escrita e acesso a tabelas não autorizadas falham, verificar cancelamento por timeout, configurar seu provedor e testar pergunta, esclarecimento e correção. Docker e integração com provedor real não foram testados nesta execução.

## Estrutura

- `db/init-scripts`: esquema, carga fictícia e papel de leitura.
- `server/src`: geração, validação, execução, explicação e rotas.
- `server/tests`: testes de ataques, fluxo e banco em PGlite.
- `web`: interface React.

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)