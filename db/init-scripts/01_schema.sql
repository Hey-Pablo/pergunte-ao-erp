-- Schema do ERP ficticio para o projeto "Pergunte ao ERP"
-- Execute em um banco PostgreSQL vazio


-- Tabela de clientes
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150),
    cnpj CHAR(14) NOT NULL,
    inscricao_estadual VARCHAR(20),
    email VARCHAR(254),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado CHAR(2),
    cep CHAR(9),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE produtos (
    produto_id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    ncm CHAR(8),
    categoria VARCHAR(100),
    preco_custo DECIMAL(12,2),
    preco_venda DECIMAL(12,2),
    unidade_medida VARCHAR(10) DEFAULT 'UN',
    estoque_minimo DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de fornecedores
CREATE TABLE fornecedores (
    fornecedor_id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    razao_social VARCHAR(150) NOT NULL,
    cnpj CHAR(14) NOT NULL,
    email VARCHAR(254),
    telefone VARCHAR(20),
    endereco TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de filiais
CREATE TABLE filiais (
    filial_id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT,
    cidade VARCHAR(100),
    estado CHAR(2),
    ativa BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de unidades de medida
CREATE TABLE unidades_medida (
    unidade_id SERIAL PRIMARY KEY,
    sigla VARCHAR(10) NOT NULL UNIQUE,
    descricao VARCHAR(50) NOT NULL
);

-- Tabela de condições de pagamento
CREATE TABLE condicoes_pagamento (
    condicao_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    praze_dias INTEGER NOT NULL,
    juros_percentual DECIMAL(5,2) DEFAULT 0,
    desconto_percentual DECIMAL(5,2) DEFAULT 0
);

-- Tabela de títulos (contas a pagar/receber)
CREATE TABLE titulos (
    titulo_id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('PAGAR', 'RECEBER')),
    historico VARCHAR(200),
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    valor DECIMAL(14,2) NOT NULL,
    cliente_fornecedor_id INTEGER,
    produto_id INTEGER REFERENCES produtos(produto_id),
    filial_id INTEGER REFERENCES filiais(filial_id),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'PAGO', 'CANCELADO', 'VENCIDO'))
);

-- Tabela de parcelas (para títulos)
CREATE TABLE parcelas (
    parcela_id SERIAL PRIMARY KEY,
    titulo_id INTEGER NOT NULL REFERENCES titulos(titulo_id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    valor DECIMAL(14,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA' CHECK (status IN ('ABERTA', 'PAGA', 'VENCIDA', 'CANCELADA'))
);

-- Tabela de notas fiscais
CREATE TABLE notas_fiscais (
    nota_id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL,
    serie VARCHAR(5) NOT NULL,
    data_emissao DATE NOT NULL,
    data_entrada DATE,
    valor_total DECIMAL(14,2) NOT NULL,
    valor_icms DECIMAL(14,2) DEFAULT 0,
    valor_ipi DECIMAL(14,2) DEFAULT 0,
    valor_inss DECIMAL(14,2) DEFAULT 0,
    cliente_id INTEGER REFERENCES clientes(cliente_id),
    filial_id INTEGER REFERENCES filiais(filial_id),
    chave_acesso CHAR(44),
    status VARCHAR(20) NOT NULL DEFAULT 'EMITIDA' CHECK (status IN ('EMITIDA', 'CANCELADA', 'INUTILIZADA'))
);

-- Tabela de itens da nota
CREATE TABLE itens_nota (
    item_id SERIAL PRIMARY KEY,
    nota_id INTEGER NOT NULL REFERENCES notas_fiscais(nota_id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(produto_id),
    quantidade DECIMAL(12,3) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    valor_desconto DECIMAL(12,2) DEFAULT 0,
    quantidade_embalagem INTEGER DEFAULT 1,
    codigo_produto VARCHAR(30)
);

-- Tabela de movimentos de estoque
CREATE TABLE movimentos_estoque (
    movimento_id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(produto_id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAÍDA')),
    quantidade DECIMAL(12,3) NOT NULL,
    preco_custo DECIMAL(12,2) NOT NULL,
    data_movimento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(100),
    usuario_id INTEGER
);

-- Indices
CREATE UNIQUE INDEX idx_clientes_cnpj ON clientes(cnpj);
CREATE UNIQUE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE UNIQUE INDEX idx_notas_serie_numero ON notas_fiscais(serie, numero);
CREATE INDEX idx_titulos_cliente ON titulos(cliente_fornecedor_id);
CREATE INDEX idx_titulos_data_vencimento ON titulos(data_vencimento);
CREATE INDEX idx_titulos_status ON titulos(status);

-- Visoes
-- Visao de saldo de estoque
CREATE VIEW v_saldo_estoque AS
SELECT
    p.produto_id,
    p.codigo,
    p.descricao,
    COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade ELSE -m.quantidade END), 0) AS saldo_atual,
    p.estoque_minimo
FROM produtos p
LEFT JOIN movimentos_estoque m ON p.produto_id = m.produto_id
WHERE p.ativo = TRUE
GROUP BY p.produto_id, p.codigo, p.descricao, p.estoque_minimo;

-- Visao de titulos com prazo vencido
CREATE VIEW v_titulos_vencidos AS
SELECT
    t.titulo_id,
    t.codigo,
    t.tipo,
    t.historico,
    t.data_vencimento,
    t.valor,
    t.status,
    (CURRENT_DATE - t.data_vencimento) AS dias_em_vencimento,
    CASE
        WHEN t.status = 'ABERTO' AND t.data_vencimento < CURRENT_DATE THEN 'VENCIDO'
        WHEN t.status = 'ABERTO' AND t.data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' THEN 'A VENCER'
        ELSE t.status
    END AS classificacao_vencimento
FROM titulos t
WHERE t.status IN ('ABERTO', 'PAGO') AND t.data_vencimento IS NOT NULL;

-- Visao de indicadores de faturamento
CREATE VIEW v_indicadores_faturamento AS
SELECT
    DATE_TRUNC('month', nf.data_emissao) AS mes_ano,
    COUNT(DISTINCT nf.nota_id) AS quantidade_notas,
    SUM(nf.valor_total) AS faturamento_bruto,
    SUM(nf.valor_icms) AS icms,
    SUM(nf.valor_ipi) AS ipi,
    COUNT(DISTINCT nf.cliente_id) AS clientes_distintos
FROM notas_fiscais nf
GROUP BY DATE_TRUNC('month', nf.data_emissao)
ORDER BY mes_ano DESC;

-- Visao de cliente inadimplente
CREATE VIEW v_clientes_inadimplentes AS
SELECT
    c.cliente_id,
    c.codigo,
    c.razao_social,
    c.cnpj,
    COUNT(t.titulo_id) AS total_titulos,
    COUNT(CASE WHEN p.status = 'ABERTA' THEN 1 END) AS titulos_em_aberto,
    SUM(p.valor) AS valor_em_aberto,
    MAX(t.data_vencimento) AS ultimo_vencimento
FROM clientes c
LEFT JOIN titulos t ON c.cliente_id = t.cliente_fornecedor_id
LEFT JOIN parcelas p ON t.titulo_id = p.titulo_id
WHERE c.ativo = TRUE
GROUP BY c.cliente_id, c.codigo, c.razao_social, c.cnpj
HAVING COUNT(CASE WHEN p.status = 'ABERTA' THEN 1 END) > 0
ORDER BY valor_em_aberto DESC;