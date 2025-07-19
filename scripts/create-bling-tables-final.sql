-- Criar extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover tabelas existentes se houver
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS bling_products CASCADE;
DROP TABLE IF EXISTS bling_tokens CASCADE;

-- Criar tabela de tokens do Bling
CREATE TABLE bling_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para bling_tokens
CREATE INDEX idx_bling_tokens_user_email ON bling_tokens(user_email);
CREATE INDEX idx_bling_tokens_expires_at ON bling_tokens(expires_at);

-- Criar tabela de produtos do Bling
CREATE TABLE bling_products (
    id SERIAL PRIMARY KEY,
    bling_id BIGINT UNIQUE,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(100),
    preco DECIMAL(10,2),
    situacao VARCHAR(50) DEFAULT 'Ativo',
    tipo VARCHAR(50) DEFAULT 'Produto',
    formato VARCHAR(50) DEFAULT 'Simples',
    descricao_curta TEXT,
    data_validade DATE,
    unidade VARCHAR(10) DEFAULT 'un',
    peso_liquido DECIMAL(8,3),
    peso_bruto DECIMAL(8,3),
    volumes INTEGER DEFAULT 1,
    itens_por_caixa INTEGER DEFAULT 1,
    gtin VARCHAR(20),
    gtin_embalagem VARCHAR(20),
    marca VARCHAR(100),
    descricao_complementar TEXT,
    link_externo VARCHAR(500),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para bling_products
CREATE INDEX idx_bling_products_bling_id ON bling_products(bling_id) WHERE bling_id IS NOT NULL;
CREATE INDEX idx_bling_products_codigo ON bling_products(codigo);
CREATE INDEX idx_bling_products_nome ON bling_products(nome);
CREATE INDEX idx_bling_products_situacao ON bling_products(situacao);

-- Criar tabela de logs de webhooks
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'received',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para webhook_logs
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_webhook_logs_resource_id ON webhook_logs(resource_id);

-- Inserir dados de exemplo para homologação
INSERT INTO bling_products (nome, codigo, preco, situacao, tipo, formato, descricao_curta, unidade, peso_liquido, peso_bruto, volumes, itens_por_caixa, marca, observacoes) VALUES
('Produto Teste 1', 'TEST001', 29.90, 'Ativo', 'Produto', 'Simples', 'Produto para teste de homologação', 'un', 0.500, 0.600, 1, 1, 'Marca Teste', 'Produto criado para homologação da API'),
('Produto Teste 2', 'TEST002', 49.90, 'Ativo', 'Produto', 'Simples', 'Segundo produto para teste', 'un', 1.000, 1.200, 1, 1, 'Marca Teste', 'Segundo produto para homologação'),
('Produto Teste 3', 'TEST003', 19.90, 'Inativo', 'Produto', 'Simples', 'Produto inativo para teste', 'un', 0.300, 0.400, 1, 1, 'Marca Teste', 'Produto inativo para teste'),
('Produto Teste 4', 'TEST004', 99.90, 'Ativo', 'Produto', 'Simples', 'Produto premium para teste', 'un', 2.000, 2.500, 1, 1, 'Marca Premium', 'Produto premium para homologação');

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('bling_tokens', 'bling_products', 'webhook_logs')
ORDER BY tablename;

-- Verificar dados inseridos
SELECT COUNT(*) as total_produtos FROM bling_products;
