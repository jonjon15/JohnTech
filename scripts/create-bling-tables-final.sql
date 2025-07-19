-- Script final para criar todas as tabelas necessárias para integração Bling
-- Versão corrigida com todas as colunas necessárias

-- Remover tabelas existentes se houver problemas
DROP TABLE IF EXISTS bling_products CASCADE;
DROP TABLE IF EXISTS bling_tokens CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS bling_api_logs CASCADE;
DROP TABLE IF EXISTS bling_webhooks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    bling_access_token TEXT,
    bling_refresh_token TEXT,
    bling_token_expires_at TIMESTAMP WITH TIME ZONE,
    bling_user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tokens do Bling (compatível com lib/db.ts)
CREATE TABLE bling_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de webhook (compatível com lib/db.ts)
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'received',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos para homologação
CREATE TABLE bling_products (
    id SERIAL PRIMARY KEY,
    bling_id BIGINT,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) DEFAULT 0.00,
    descricao TEXT,
    situacao VARCHAR(20) DEFAULT 'Ativo',
    tipo VARCHAR(10) DEFAULT 'P',
    formato VARCHAR(10) DEFAULT 'S',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de API
CREATE TABLE bling_api_logs (
    id SERIAL PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status_code INTEGER,
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    duration_ms INTEGER,
    request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuração de webhooks
CREATE TABLE bling_webhooks (
    id SERIAL PRIMARY KEY,
    webhook_id VARCHAR(100) UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bling_tokens_user_email ON bling_tokens(user_email);
CREATE INDEX idx_bling_tokens_expires_at ON bling_tokens(expires_at);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_bling_products_codigo ON bling_products(codigo);
CREATE INDEX idx_bling_products_situacao ON bling_products(situacao);
CREATE UNIQUE INDEX idx_bling_products_bling_id ON bling_products(bling_id) WHERE bling_id IS NOT NULL;
CREATE INDEX idx_bling_api_logs_endpoint ON bling_api_logs(endpoint);
CREATE INDEX idx_bling_api_logs_status ON bling_api_logs(status_code);
CREATE INDEX idx_bling_api_logs_created_at ON bling_api_logs(created_at);

-- Inserir usuário padrão
INSERT INTO users (email, name, created_at, updated_at)
VALUES ('admin@johntech.com', 'Admin JohnTech', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Inserir dados de teste para homologação
INSERT INTO bling_products (nome, codigo, preco, descricao, situacao) VALUES
('Produto Teste 1', 'TEST001', 99.90, 'Produto para homologação Bling', 'Ativo'),
('Produto Teste 2', 'TEST002', 149.90, 'Segundo produto de teste', 'Ativo'),
('Produto Teste 3', 'TEST003', 79.90, 'Terceiro produto de teste', 'Inativo'),
('Copo do Bling', 'COD-4587', 32.56, 'Produto oficial para homologação', 'Ativo');

-- Verificar estrutura criada
SELECT 
  'users' as tabela,
  COUNT(*) as registros
FROM users
UNION ALL
SELECT 
  'bling_tokens' as tabela,
  COUNT(*) as registros
FROM bling_tokens
UNION ALL
SELECT 
  'webhook_logs' as tabela,
  COUNT(*) as registros
FROM webhook_logs
UNION ALL
SELECT 
  'bling_products' as tabela,
  COUNT(*) as registros
FROM bling_products
UNION ALL
SELECT 
  'bling_api_logs' as tabela,
  COUNT(*) as registros
FROM bling_api_logs
UNION ALL
SELECT 
  'bling_webhooks' as tabela,
  COUNT(*) as registros
FROM bling_webhooks;
