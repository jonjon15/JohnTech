-- Verificar se o usuário existe e criar se necessário
-- Execute este script no SQL Editor do Neon

-- Primeiro, vamos verificar se o usuário existe
SELECT * FROM users WHERE email = 'admin@example.com';

-- Se não existir (resultado vazio), execute o INSERT abaixo:
INSERT INTO users (email, name) VALUES 
('admin@example.com', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Verificar novamente se foi criado
SELECT * FROM users WHERE email = 'admin@example.com';

-- Mostrar todos os usuários na tabela (para debug)
SELECT id, email, name, 
       CASE 
         WHEN bling_access_token IS NOT NULL THEN 'Token presente'
         ELSE 'Sem token'
       END as token_status,
       created_at
FROM users;
