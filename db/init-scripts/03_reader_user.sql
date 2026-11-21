-- Execute como administrador no banco fictício. Defina a senha separadamente com \password reader_user.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reader_user') THEN
    CREATE ROLE reader_user LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM reader_user;
GRANT USAGE ON SCHEMA public TO reader_user;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM reader_user;
GRANT SELECT ON clientes, produtos, fornecedores, filiais, titulos, notas_fiscais,
  itens_nota, movimentos_estoque, v_saldo_estoque, v_titulos_vencidos,
  v_indicadores_faturamento, v_clientes_inadimplentes TO reader_user;
ALTER ROLE reader_user SET statement_timeout = '30s';
ALTER ROLE reader_user SET default_transaction_read_only = on;
ALTER ROLE reader_user SET search_path = public, pg_catalog;
