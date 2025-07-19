-- Teste de integração do banco de dados
-- Verifica se as tabelas necessárias existem e estão funcionando

-- Verificar tabela de usuários
SELECT 'users table' as test_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
            THEN 'PASS' ELSE 'FAIL' END as result;

-- Verificar tabela de tokens  
SELECT 'bling_tokens table' as test_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bling_tokens')
            THEN 'PASS' ELSE 'FAIL' END as result;

-- Verificar tabela de produtos
SELECT 'bling_products table' as test_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bling_products')
            THEN 'PASS' ELSE 'FAIL' END as result;

-- Verificar tabela de webhooks
SELECT 'bling_webhooks table' as test_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bling_webhooks')
            THEN 'PASS' ELSE 'FAIL' END as result;

-- Testar inserção de token (exemplo)
INSERT INTO bling_tokens (user_id, access_token, refresh_token, expires_at, created_at)
VALUES ('test-user', 'test-access-token', 'test-refresh-token', NOW() + INTERVAL '1 hour', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  access_token = EXCLUDED.access_token,
  refresh_token = EXCLUDED.refresh_token,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();

-- Verificar se a inserção funcionou
SELECT 'token insertion' as test_name,
       CASE WHEN EXISTS (SELECT 1 FROM bling_tokens WHERE user_id = 'test-user')
            THEN 'PASS' ELSE 'FAIL' END as result;

-- Limpar dados de teste
DELETE FROM bling_tokens WHERE user_id = 'test-user';

-- Mostrar estatísticas das tabelas
SELECT 'users count' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'bling_products count' as metric, COUNT(*) as value FROM bling_products
UNION ALL  
SELECT 'bling_webhooks count' as metric, COUNT(*) as value FROM bling_webhooks;

-- Verificar estrutura das tabelas
\d bling_tokens;
\d bling_products;
\d bling_webhooks;

SELECT 'Database integration test completed! 🎉' as final_status;
