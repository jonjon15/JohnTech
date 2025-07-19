-- Criar tabela de tokens do Bling
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

-- Inserir usuário padrão se não existir
INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at, created_at, updated_at)
VALUES ('admin@johntech.com', 'temp_token', 'temp_refresh', NOW() + INTERVAL '1 hour', NOW(), NOW())
ON CONFLICT (user_email) DO NOTHING;

-- Verificar se a tabela foi criada
SELECT 'Tabela bling_tokens criada com sucesso' as status;
