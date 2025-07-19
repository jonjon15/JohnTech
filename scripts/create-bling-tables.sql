-- Criar tabela para armazenar tokens do Bling
CREATE TABLE IF NOT EXISTS bling_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bling_tokens_user_email ON bling_tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_bling_tokens_expires_at ON bling_tokens(expires_at);

-- Criar tabela para logs de webhooks (opcional)
CREATE TABLE IF NOT EXISTS bling_webhook_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'received'
);

-- Criar índice para logs de webhooks
CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_event_type ON bling_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_processed_at ON bling_webhook_logs(processed_at);

-- Inserir usuário padrão se não existir
INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at)
VALUES ('admin@johntech.com', 'placeholder', 'placeholder', NOW() - INTERVAL '1 day')
ON CONFLICT (user_email) DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bling_tokens', 'bling_webhook_logs')
ORDER BY table_name;
