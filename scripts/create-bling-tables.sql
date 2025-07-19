-- Criar tabela para tokens do Bling
CREATE TABLE IF NOT EXISTS bling_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_bling_tokens_user_email ON bling_tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_bling_tokens_expires_at ON bling_tokens(expires_at);

-- Criar tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'received',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Inserir usuário padrão se não existir
INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at)
VALUES ('admin@johntech.com', 'temp', 'temp', NOW() - INTERVAL '1 day')
ON CONFLICT (user_email) DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bling_tokens', 'webhook_logs');
