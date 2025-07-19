-- Script para criar todas as tabelas necessárias para integração Bling
-- Versão corrigida sem constraint NOT NULL no bling_id

-- Remover tabelas existentes se houver problemas de constraint
DROP TABLE IF EXISTS bling_products CASCADE;
DROP TABLE IF EXISTS bling_auth_tokens CASCADE;
DROP TABLE IF EXISTS bling_webhook_events CASCADE;
DROP TABLE IF EXISTS bling_api_logs CASCADE;
DROP TABLE IF EXISTS bling_webhooks CASCADE;

-- Tabela de tokens de autenticação OAuth
CREATE TABLE bling_auth_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos (bling_id pode ser NULL para produtos locais)
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

-- Tabela de eventos de webhook
CREATE TABLE bling_webhook_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
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
CREATE INDEX idx_bling_products_codigo ON bling_products(codigo);
CREATE INDEX idx_bling_products_situacao ON bling_products(situacao);
CREATE UNIQUE INDEX idx_bling_products_bling_id ON bling_products(bling_id) WHERE bling_id IS NOT NULL;

CREATE INDEX idx_bling_webhook_events_type ON bling_webhook_events(event_type);
CREATE INDEX idx_bling_webhook_events_processed ON bling_webhook_events(processed);
CREATE INDEX idx_bling_webhook_events_received_at ON bling_webhook_events(received_at);

CREATE INDEX idx_bling_api_logs_endpoint ON bling_api_logs(endpoint);
CREATE INDEX idx_bling_api_logs_status ON bling_api_logs(status_code);
CREATE INDEX idx_bling_api_logs_created_at ON bling_api_logs(created_at);

-- Inserir dados de teste (sem bling_id para evitar constraint)
INSERT INTO bling_products (nome, codigo, preco, descricao, situacao) VALUES
('Produto Teste 1', 'TEST001', 99.90, 'Produto para homologação Bling', 'Ativo'),
('Produto Teste 2', 'TEST002', 149.90, 'Segundo produto de teste', 'Ativo'),
('Produto Teste 3', 'TEST003', 79.90, 'Terceiro produto de teste', 'Inativo'),
('Copo do Bling', 'COD-4587', 32.56, 'Produto oficial para homologação', 'Ativo');

-- Verificar estrutura criada
SELECT 
  'bling_auth_tokens' as tabela,
  COUNT(*) as registros
FROM bling_auth_tokens
UNION ALL
SELECT 
  'bling_products' as tabela,
  COUNT(*) as registros
FROM bling_products
UNION ALL
SELECT 
  'bling_webhook_events' as tabela,
  COUNT(*) as registros
FROM bling_webhook_events
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
