-- Teste de integração do sistema Bling
-- Este script verifica se todas as tabelas e configurações estão corretas

-- 1. Verifica se a tabela users existe e tem as colunas corretas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verifica se existem usuários cadastrados
SELECT 
    id,
    email,
    name,
    CASE 
        WHEN bling_access_token IS NOT NULL THEN 'Configurado'
        ELSE 'Não configurado'
    END as token_status,
    CASE 
        WHEN bling_token_expires_at > NOW() THEN 'Válido'
        WHEN bling_token_expires_at IS NULL THEN 'Não definido'
        ELSE 'Expirado'
    END as token_validity,
    created_at,
    updated_at
FROM users;

-- 3. Verifica tokens expirados
SELECT 
    email,
    bling_token_expires_at,
    CASE 
        WHEN bling_token_expires_at < NOW() THEN 'Expirado'
        WHEN bling_token_expires_at > NOW() THEN 'Válido'
        ELSE 'Não definido'
    END as status,
    EXTRACT(EPOCH FROM (bling_token_expires_at - NOW()))/3600 as hours_until_expiry
FROM users 
WHERE bling_access_token IS NOT NULL;

-- 4. Estatísticas gerais
SELECT 
    COUNT(*) as total_users,
    COUNT(bling_access_token) as users_with_tokens,
    COUNT(CASE WHEN bling_token_expires_at > NOW() THEN 1 END) as users_with_valid_tokens,
    COUNT(CASE WHEN bling_token_expires_at < NOW() THEN 1 END) as users_with_expired_tokens
FROM users;

-- 5. Verifica se as variáveis de ambiente estão sendo usadas
-- (Este é um comentário informativo - as variáveis são verificadas no código)
/*
Variáveis que devem estar configuradas:
- BLING_CLIENT_ID
- BLING_CLIENT_SECRET  
- BLING_WEBHOOK_SECRET
- DATABASE_URL
- NEXT_PUBLIC_BASE_URL
*/

-- 6. Teste de inserção (opcional - descomente para testar)
/*
INSERT INTO users (email, name, created_at, updated_at) 
VALUES ('teste@exemplo.com', 'Usuário Teste', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
*/

-- 7. Limpeza de dados de teste (descomente se necessário)
/*
DELETE FROM users WHERE email = 'teste@exemplo.com';
*/
