-- Criacao do usuario de leitura para seguranca
-- Execute como superusuario ou o proprietario do banco

-- Criar usuario de leitura
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reader_user') THEN
        CREATE USER reader_user WITH PASSWORD 'reader_password_change_me';
    END IF;
END
$$;

-- Conceder permissoes de leitura
GRANT CONNECT ON DATABASE pergunte_erp TO reader_user;
GRANT USAGE ON SCHEMA public TO reader_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reader_user;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO reader_user;

-- Configurar timeout de statement
ALTER ROLE reader_user SET statement_timeout = '30s';

-- Restringir funcoes perigosas
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM reader_user;

-- Configurar busca padrao
ALTER ROLE reader_user SET search_path TO public;