-- Dados ficticios de exemplo para demonstracao
-- Execute após o script de schema

-- Inserir filiais
INSERT INTO filiais (codigo, nome, cidade, estado, ativa) VALUES
('001', 'Sede - Sao Paulo', 'Sao Paulo', 'SP', true),
('002', 'Filial - Rio de Janeiro', 'Rio de Janeiro', 'RJ', true),
('003', 'Filial - Belo Horizonte', 'Belo Horizonte', 'MG', true);

-- Inserir vendedores
INSERT INTO vendedores (codigo, nome, comissao_percentual) VALUES
('V001', 'Carlos Silva', 5.00),
('V002', 'Maria Santos', 4.50);

-- Inserir categorias
INSERT INTO categorias (nome, descricao) VALUES
('Eletronicos', 'Produtos eletronicos'),
('Informatica', 'Hardware e software'),
('Material Escolar', 'Material didatico');

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
(2, 11, 1, 85.00, 1),
(3, 1, 1, 4500.00, 1),
(3, 2, 1, 350.00, 1),
(3, 4, 1, 1200.00, 1),
(4, 4, 1, 1200.00, 1),
(5, 1, 1, 4500.00, 1),
(5, 3, 2, 280.00, 2),
(5, 20, 1, 220.00, 1),
(6, 18, 1, 180.00, 1),
(7, 15, 1, 95.00, 1),
(8, 12, 1, 150.00, 1),
(8, 13, 1, 120.00, 1),
(9, 15, 1, 95.00, 1),
(10, 1, 1, 4500.00, 1),
(10, 6, 5, 12.00, 10),
(10, 7, 10, 2.50, 20);

-- Inserir movimentos de estoque
INSERT INTO movimentos_estoque (produto_id, tipo, quantidade, preco_custo, motivo) VALUES
(1, 'ENTRADA', 10, 3200.00, 'Compra fornecedor'),
(2, 'ENTRADA', 50, 250.00, 'Compra fornecedor'),
(3, 'ENTRADA', 40, 200.00, 'Compra fornecedor'),
(4, 'ENTRADA', 5, 900.00, 'Compra fornecedor'),
(5, 'ENTRADA', 15, 280.00, 'Compra fornecedor'),
(6, 'ENTRADA', 200, 8.00, 'Compra material escolar'),
(7, 'ENTRADA', 500, 2.00, 'Compra material escolar'),
(1, 'SAÍDA', 1, 3200.00, 'Venda nota 1001'),
(2, 'SAÍDA', 1, 250.00, 'Venda nota 1002'),
(3, 'SAÍDA', 1, 200.00, 'Venda nota 1003'),
(4, 'SAÍDA', 1, 900.00, 'Venda nota 1004'),
(11, 'ENTRADA', 20, 70.00, 'Compra fornecedor'),
(12, 'ENTRADA', 15, 130.00, 'Compra fornecedor'),
(13, 'ENTRADA', 8, 100.00, 'Compra fornecedor'),
(15, 'ENTRADA', 50, 70.00, 'Compra fornecedor'),
(16, 'ENTRADA', 25, 90.00, 'Compra fornecedor'),
(17, 'ENTRADA', 15, 100.00, 'Compra fornecedor'),
(18, 'ENTRADA', 10, 150.00, 'Compra fornecedor'),
(19, 'ENTRADA', 8, 200.00, 'Compra fornecedor'),
(20, 'ENTRADA', 12, 180.00, 'Compra fornecedor');

-- Inserir títulos (contas a pagar/receber)
INSERT INTO titulos (codigo, tipo, historico, data_emissao, data_vencimento, valor, cliente_fornecedor_id, filial_id, status) VALUES
('T-2026-001', 'RECEBER', 'Venda nota 1001', '2026-10-01', '2026-10-31', 4500.00, 1, 1, 'ABERTO'),
('T-2026-002', 'RECEBER', 'Venda nota 1002', '2026-10-05', '2026-11-04', 850.00, 2, 2, 'ABERTO'),
('T-2026-003', 'RECEBER', 'Venda nota 1003', '2026-10-10', '2026-11-09', 5330.00, 3, 3, 'ABERTO'),
('T-2026-004', 'RECEBER', 'Venda nota 1004', '2026-10-15', '2026-11-14', 1200.00, 4, 4, 'ABERTO'),
('T-2026-005', 'RECEBER', 'Venda nota 1005', '2026-10-20', '2026-11-19', 5850.00, 5, 5, 'ABERTO'),
('T-2026-006', 'RECEBER', 'Venda nota 1006', '2026-10-25', '2026-11-24', 220.00, 6, 1, 'ABERTO'),
('T-2026-007', 'RECEBER', 'Venda nota 1007', '2026-10-28', '2026-11-27', 130.00, 7, 2, 'ABERTO'),
('T-2026-008', 'RECEBER', 'Venda nota 1008', '2026-10-30', '2026-12-01', 1030.00, 8, 3, 'ABERTO'),
('T-2026-009', 'RECEBER', 'Venda nota 1009', '2026-11-02', '2026-11-30', 95.00, 9, 4, 'ABERTO'),
('T-2026-010', 'RECEBER', 'Venda nota 1010', '2026-11-05', '2026-12-05', 4580.00, 10, 1, 'ABERTO');

-- Inserir parcelas
INSERT INTO parcelas (titulo_id, numero_parcela, valor, data_vencimento, status) VALUES
(1, 1, 4500.00, '2026-10-31', 'ABERTA'),
(2, 1, 850.00, '2026-11-04', 'ABERTA'),
(3, 1, 5330.00, '2026-11-09', 'ABERTA'),
(3, 2, 3470.00, '2026-12-09', 'ABERTA'),
(4, 1, 1200.00, '2026-11-14', 'ABERTA'),
(5, 1, 2925.00, '2026-11-19', 'ABERTA'),
(5, 2, 2925.00, '2026-12-19', 'ABERTA'),
(6, 1, 220.00, '2026-11-24', 'ABERTA'),
(7, 1, 130.00, '2026-11-27', 'ABERTA'),
(8, 1, 1030.00, '2026-12-01', 'ABERTA'),
(9, 1, 95.00, '2026-11-30', 'ABERTA'),
(10, 1, 4580.00, '2026-12-05', 'ABERTA');