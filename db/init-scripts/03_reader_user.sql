-- Criação do usuário de leitura para segurança
-- Execute como superusuario ou o proprietário do banco após o schema

-- Criar usuário de leitura (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reader_user') THEN
        CREATE USER reader_user WITH PASSWORD 'reader_password_change_me';
    END IF;
END
$$;

-- Conceder permissões de leitura nas tabelas
GRANT CONNECT ON DATABASE pergunte_erp TO reader_user;
GRANT USAGE ON SCHEMA public TO reader_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reader_user;

-- Conceder permissões nas visões
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO reader_user;

-- Configurar timeout de statement para segurança
ALTER ROLE reader_user SET statement_timeout = '30s';

-- Restringir funções perigosas (DROP, ALTER, etc.)
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM reader_user;

-- Configurar busca padrão para o schema
ALTER ROLE reader_user SET search_path TO public;