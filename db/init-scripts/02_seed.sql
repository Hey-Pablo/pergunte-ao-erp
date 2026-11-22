-- Dados ficticios de exemplo para demonstracao
-- Execute após o script de schema

-- Inserir filiais
INSERT INTO filiais (codigo, nome, cidade, estado, ativa) VALUES
('001', 'Sede - Sao Paulo', 'Sao Paulo', 'SP', true),
('002', 'Filial - Rio de Janeiro', 'Rio de Janeiro', 'RJ', true),
('003', 'Filial - Belo Horizonte', 'Belo Horizonte', 'MG', true);


-- Inserir clientes ficticios
INSERT INTO clientes (codigo, razao_social, cnpj, email, cidade, estado, ativo) VALUES
('CLI001', 'Empresa Ficticia A LTDA', '12345678000191', 'contato@testea.com', 'Sao Paulo', 'SP', true),
('CLI002', 'Empresa Ficticia B ME', '98765432000155', 'contato@testeb.com', 'Rio de Janeiro', 'RJ', true),
('CLI003', 'Comercio Ficticio C', '11111111000191', 'contato@testec.com', 'Belo Horizonte', 'MG', true);

-- Inserir produtos ficticios
INSERT INTO produtos (codigo, descricao, ncm, categoria, preco_venda, estoque_minimo) VALUES
('PROD001', 'Notebook Dell Inspiron 15', '84715900', 'Informatica', 4500.00, 5),
('PROD002', 'Mouse Logitech MX Master 3', '84715900', 'Informatica', 350.00, 10),
('PROD003', 'Teclado Mecânico Redragon K552', '84715900', 'Informatica', 280.00, 10),
('PROD004', 'Monitor 24" LG UltraWide', '84715900', 'Informatica', 1200.00, 3);

-- Inserir condicoes de pagamento
INSERT INTO condicoes_pagamento (nome, praze_dias, juros_percentual, desconto_percentual) VALUES
('Pagamento a Vista', 0, 0, 5.00),
('A 30 Dias', 30, 0, 0),
('A 60 Dias', 60, 1.00, 0);

-- Inserir notas fiscais
INSERT INTO notas_fiscais (numero, serie, data_emissao, data_entrada, valor_total, valor_icms, cliente_id, filial_id, chave_acesso, status) VALUES
(1001, 'N', '2026-10-01', '2026-10-01', 4500.00, 378.00, 1, 1, '11000100123456789012345678901234567890123456', 'EMITIDA'),
(1002, 'N', '2026-10-05', '2026-10-05', 850.00, 70.85, 2, 2, '11000200123456789012345678901234567890123457', 'EMITIDA'),
(1003, 'N', '2026-10-10', '2026-10-10', 5330.00, 444.05, 3, 3, '11000300123456789012345678901234567890123458', 'EMITIDA');

-- Inserir itens das notas
INSERT INTO itens_nota (nota_id, produto_id, quantidade, valor_unitario, quantidade_embalagem) VALUES
(1, 1, 1, 4500.00, 1),
(2, 2, 1, 350.00, 1),
(3, 1, 1, 4500.00, 1),
(3, 2, 1, 350.00, 1),
(3, 4, 1, 1200.00, 1);

-- Inserir movimentos de estoque
INSERT INTO movimentos_estoque (produto_id, tipo, quantidade, preco_custo, motivo) VALUES
(1, 'ENTRADA', 10, 3200.00, 'Compra fornecedor'),
(2, 'ENTRADA', 50, 250.00, 'Compra fornecedor'),
(3, 'ENTRADA', 40, 200.00, 'Compra fornecedor'),
(4, 'ENTRADA', 5, 900.00, 'Compra fornecedor'),
(1, 'SAÍDA', 1, 3200.00, 'Venda nota 1001'),
(2, 'SAÍDA', 1, 250.00, 'Venda nota 1002'),
(3, 'SAÍDA', 1, 200.00, 'Venda nota 1003'),
(4, 'SAÍDA', 1, 900.00, 'Venda nota 1003');

-- Inserir títulos (contas a pagar/receber)
INSERT INTO titulos (codigo, tipo, historico, data_emissao, data_vencimento, valor, cliente_fornecedor_id, filial_id, status) VALUES
('T-2026-001', 'RECEBER', 'Venda nota 1001', '2026-10-01', '2026-10-31', 4500.00, 1, 1, 'ABERTO'),
('T-2026-002', 'RECEBER', 'Venda nota 1002', '2026-10-05', '2026-11-04', 850.00, 2, 2, 'ABERTO'),
('T-2026-003', 'RECEBER', 'Venda nota 1003', '2026-10-10', '2026-11-09', 5330.00, 3, 3, 'ABERTO');

-- Inserir parcelas
INSERT INTO parcelas (titulo_id, numero_parcela, valor, data_vencimento, status) VALUES
(1, 1, 4500.00, '2026-10-31', 'ABERTA'),
(2, 1, 850.00, '2026-11-04', 'ABERTA'),
(3, 1, 5330.00, '2026-11-09', 'ABERTA');