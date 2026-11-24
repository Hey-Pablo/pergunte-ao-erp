-- Dados fictícios para demonstração
-- Execute após o script de schema

-- Inserir filiais
INSERT INTO filiais (codigo, nome, cidade, estado) VALUES
('001', 'Sede - São Paulo', 'São Paulo', 'SP'),
('002', 'Filial - Rio de Janeiro', 'Rio de Janeiro', 'RJ'),
('003', 'Filial - Belo Horizonte', 'Belo Horizonte', 'MG'),
('004', 'Filial - Porto Alegre', 'Porto Alegre', 'RS'),
('005', 'Filial - Curitiba', 'Curitiba', 'PR');

-- Inserir clientes ficticios
INSERT INTO clientes (codigo, razao_social, cnpj, email, cidade, estado, ativo) VALUES
('CLI001', 'Empresa Ficticia A LTDA', '12345678000191', 'contato@testea.com', 'São Paulo', 'SP', TRUE),
('CLI002', 'Empresa Ficticia B ME', '98765432000155', 'contato@testeb.com', 'Rio de Janeiro', 'RJ', TRUE),
('CLI003', 'Comercio Ficticio C EIRELI', '11111111000191', 'contato@testec.com', 'Belo Horizonte', 'MG', TRUE),
('CLI004', 'Padaria D S/A', '22222222000191', 'contato@tested.com', 'Porto Alegre', 'RS', TRUE),
('CLI005', 'Mercado E Ltda', '33333333000191', 'contato@testee.com', 'Curitiba', 'PR', TRUE),
('CLI006', 'Servicos Ficticios F', '44444444000191', 'contato@testef.com', 'São Paulo', 'SP', TRUE),
('CLI007', 'Industria G LTDA', '55555555000191', 'contato@testeg.com', 'Fortaleza', 'CE', TRUE),
('CLI008', 'Construcao H S/A', '66666666000191', 'contato@testeh.com', 'Manaus', 'AM', TRUE),
('CLI009', 'Transporte I Ltda', '77777777000191', 'contato@testei.com', 'Recife', 'PE', TRUE),
('CLI010', 'Alimentos J ME', '88888888000191', 'contato@testej.com', 'Salvador', 'BA', TRUE),
('CLI011', 'Farmacia K LTDA', '99999999000191', 'contato@testek.com', 'São Paulo', 'SP', FALSE),
('CLI012', 'Lojas L S/A', '00000000000191', 'contato@testel.com', 'São Paulo', 'SP', TRUE);

-- Inserir produtos ficticios
INSERT INTO produtos (codigo, descricao, ncm, categoria, preco_venda, estoque_minimo) VALUES
('PROD001', 'Notebook Dell Inspiron 15', '84715900', 'Informatica', 4500.00, 5),
('PROD002', 'Mouse Logitech MX Master 3', '84715900', 'Informatica', 350.00, 10),
('PROD003', 'Teclado Mecânico Redragon K552', '84715900', 'Informatica', 280.00, 10),
('PROD004', 'Monitor 24" LG UltraWide', '84715900', 'Informatica', 1200.00, 3),
('PROD005', 'HD Externo 1TB Seagate', '84715900', 'Informatica', 350.00, 5),
('PROD006', 'Caderno Didatico A5 100 folhas', '49018100', 'Matematica', 12.00, 50),
('PROD007', 'Caneta Bic Preta Refil', '49018100', 'Matematica', 2.50, 100),
('PROD008', 'Lápis Matemático 2B', '49018100', 'Matematica', 5.00, 100),
('PROD009', 'Régua de Aço 30cm', '49018100', 'Matematica', 8.00, 50),
('PROD010', 'Corretor Automático', '49018100', 'Matematica', 15.00, 50),
('PROD011', 'Camiseta Mascote Tecnologia', '61041900', 'Vestuario', 85.00, 10),
('PROD012', 'Calça Jeans Social Preta', '61041900', 'Vestuario', 150.00, 10),
('PROD013', 'Moletom Cozinha Preto', '61041900', 'Vestuario', 120.00, 5),
('PROD014', 'Chaveiro de Caneta USB', '49018100', 'Matematica', 45.00, 50),
('PROD015', 'Livro Programacao JS Básico', '49018100', 'Livros', 95.00, 3),
('PROD016', 'Livro Algoritmos para Iniciantes', '49018100', 'Livros', 120.00, 2),
('PROD017', 'Livro SQL para Desenvolvedores', '49018100', 'Livros', 130.00, 3),
('PROD018', 'Adaptador USB-C HDMI 4K', '85176200', 'Informatica', 180.00, 5),
('PROD019', 'Webcam Logitech C920', '85176200', 'Informatica', 280.00, 3),
('PROD020', 'Fone de Ouvido Bluetooth JBL', '85183000', 'Informatica', 220.00, 5);

-- Inserir notas fiscais
INSERT INTO notas_fiscais (numero, serie, data_emissao, data_entrada, valor_total, valor_icms, cliente_id, filial_id, chave_acesso, status) VALUES
(1, 'N', '2026-10-01', '2026-10-01', 4500.00, 378.00, 1, 1, '11000100123456789012345678901234567890123456', 'EMITIDA'),
(2, 'N', '2026-10-05', '2026-10-05', 850.00, 70.85, 2, 2, '11000200123456789012345678901234567890123457', 'EMITIDA'),
(3, 'N', '2026-10-10', '2026-10-10', 5330.00, 444.05, 3, 3, '11000300123456789012345678901234567890123458', 'EMITIDA'),
(4, 'N', '2026-10-15', '2026-10-15', 1200.00, 100.00, 4, 4, '11000400123456789012345678901234567890123459', 'EMITIDA'),
(5, 'N', '2026-10-20', '2026-10-20', 5850.00, 486.75, 5, 5, '11000500123456789012345678901234567890123460', 'EMITIDA'),
(6, 'N', '2026-10-25', '2026-10-25', 220.00, 18.36, 6, 1, '11000100123456789012345678901234567890123461', 'EMITIDA'),
(7, 'N', '2026-10-28', '2026-10-28', 130.00, 10.85, 7, 2, '11000200123456789012345678901234567890123462', 'EMITIDA'),
(8, 'N', '2026-10-30', '2026-10-30', 1030.00, 85.75, 8, 3, '11000300123456789012345678901234567890123463', 'EMITIDA'),
(9, 'N', '2026-11-02', '2026-11-02', 95.00, 7.91, 9, 4, '11000400123456789012345678901234567890123464', 'EMITIDA'),
(10, 'N', '2026-11-05', '2026-11-05', 4580.00, 382.20, 10, 5, '11000500123456789012345678901234567890123465', 'EMITIDA');

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
(1, 'SAÍDA', 1, 3200.00, 'Venda nota 1'),
(2, 'SAÍDA', 1, 250.00, 'Venda nota 2'),
(3, 'SAÍDA', 1, 200.00, 'Venda nota 3'),
(4, 'SAÍDA', 1, 900.00, 'Venda nota 4'),
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
('T-2026-001', 'RECEBER', 'Venda nota 1', '2026-10-01', '2026-10-31', 4500.00, 1, 1, 'ABERTO'),
('T-2026-002', 'RECEBER', 'Venda nota 2', '2026-10-05', '2026-11-04', 850.00, 2, 2, 'ABERTO'),
('T-2026-003', 'RECEBER', 'Venda nota 3', '2026-10-10', '2026-11-09', 5330.00, 3, 3, 'ABERTO'),
('T-2026-004', 'RECEBER', 'Venda nota 4', '2026-10-15', '2026-11-14', 1200.00, 4, 4, 'ABERTO'),
('T-2026-005', 'RECEBER', 'Venda nota 5', '2026-10-20', '2026-11-19', 5850.00, 5, 5, 'ABERTO'),
('T-2026-006', 'RECEBER', 'Venda nota 6', '2026-10-25', '2026-11-24', 220.00, 6, 1, 'ABERTO'),
('T-2026-007', 'RECEBER', 'Venda nota 7', '2026-10-28', '2026-11-27', 130.00, 7, 2, 'ABERTO'),
('T-2026-008', 'RECEBER', 'Venda nota 8', '2026-10-30', '2026-12-01', 1030.00, 8, 3, 'ABERTO'),
('T-2026-009', 'RECEBER', 'Venda nota 9', '2026-11-02', '2026-11-30', 95.00, 9, 4, 'ABERTO'),
('T-2026-010', 'RECEBER', 'Venda nota 10', '2026-11-05', '2026-12-05', 4580.00, 10, 1, 'ABERTO');

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