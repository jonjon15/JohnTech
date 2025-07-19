-- Teste de integração do banco de dados
-- Verifica se as tabelas necessárias existem

-- Verificar se a tabela de usuários existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'users'
    ) 
    THEN 'users table exists ✅'
    ELSE 'users table missing ❌'
  END as users_status;

-- Verificar se a tabela de tokens existe  
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'bling_tokens'
    ) 
    THEN 'bling_tokens table exists ✅'
    ELSE 'bling_tokens table missing ❌'
  END as tokens_status;

-- Verificar se a tabela de produtos existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'products'
    ) 
    THEN 'products table exists ✅'
    ELSE 'products table missing ❌'
  END as products_status;

-- Teste de inserção simples
INSERT INTO users (email, name, created_at) 
VALUES ('test@example.com', 'Test User', NOW())
ON CONFLICT (email) DO NOTHING;

-- Verificar se o usuário foi inserido
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM users WHERE email = 'test@example.com'
    )
    THEN 'Test user created ✅'
    ELSE 'Failed to create test user ❌'
  END as user_creation_status;

-- Limpar dados de teste
DELETE FROM users WHERE email = 'test@example.com';

SELECT 'Database integration test completed! 🎉' as final_status;
