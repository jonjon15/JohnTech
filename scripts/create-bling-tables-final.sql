-- Script para criar todas as tabelas necessárias para a integração Bling
-- Execute este script no seu banco de dados Vercel Postgres

-- Remover tabelas existentes (cuidado: isso apaga todos os dados!)
DROP TABLE IF EXISTS bling_webhook_logs CASCADE;
DROP TABLE IF EXISTS bling_products CASCADE;
DROP TABLE IF EXISTS bling_tokens CASCADE;

-- Criar tabela de tokens de autenticação
CREATE TABLE bling_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para otimizar consultas
CREATE INDEX idx_bling_tokens_user_email ON bling_tokens(user_email);
CREATE INDEX idx_bling_tokens_expires_at ON bling_tokens(expires_at);

-- Criar tabela de produtos
CREATE TABLE bling_products (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque INTEGER NOT NULL DEFAULT 0,
    bling_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para produtos
CREATE INDEX idx_bling_products_nome ON bling_products(nome);
CREATE INDEX idx_bling_products_bling_id ON bling_products(bling_id);
CREATE INDEX idx_bling_products_created_at ON bling_products(created_at);

-- Criar tabela de logs de webhook
CREATE TABLE bling_webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para logs de webhook
CREATE INDEX idx_webhook_logs_event_type ON bling_webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_processed ON bling_webhook_logs(processed);
CREATE INDEX idx_webhook_logs_created_at ON bling_webhook_logs(created_at);

-- Inserir dados de teste
INSERT INTO bling_products (nome, descricao, preco, estoque) VALUES
('Produto Teste 1', 'Produto para homologação da integração Bling', 99.90, 10),
('Produto Teste 2', 'Segundo produto de teste', 149.50, 5),
('Produto Teste 3', 'Terceiro produto para validação', 79.99, 15);

-- Verificar se as tabelas foram criadas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('bling_tokens', 'bling_products', 'bling_webhook_logs')
ORDER BY table_name, ordinal_position;

-- Verificar dados de teste
SELECT 'bling_products' as tabela, COUNT(*) as total FROM bling_products
UNION ALL
SELECT 'bling_tokens' as tabela, COUNT(*) as total FROM bling_tokens
UNION ALL
SELECT 'bling_webhook_logs' as tabela, COUNT(*) as total FROM bling_webhook_logs;

-- Mostrar produtos de teste inseridos
SELECT id, nome, preco, estoque, created_at FROM bling_products ORDER BY id;
