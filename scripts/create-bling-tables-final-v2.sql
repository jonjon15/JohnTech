-- Criar tabelas para integração Bling
-- Executar este script no banco de dados

-- Remover tabelas existentes se houver problemas de estrutura
DROP TABLE IF EXISTS bling_webhook_logs CASCADE;
DROP TABLE IF EXISTS bling_products CASCADE;
DROP TABLE IF EXISTS bling_auth CASCADE;

-- Tabela para armazenar tokens de autenticação OAuth
CREATE TABLE bling_auth (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice único para user_email
CREATE UNIQUE INDEX idx_bling_auth_user_email ON bling_auth(user_email);

-- Tabela para produtos do Bling
CREATE TABLE bling_products (
  id SERIAL PRIMARY KEY,
  bling_id INTEGER,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) DEFAULT 0,
  descricao_curta TEXT,
  situacao VARCHAR(50) DEFAULT 'Ativo',
  tipo VARCHAR(10) DEFAULT 'P',
  formato VARCHAR(10) DEFAULT 'S',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice único para codigo
CREATE UNIQUE INDEX idx_bling_products_codigo ON bling_products(codigo);

-- Criar índice para bling_id
CREATE INDEX idx_bling_products_bling_id ON bling_products(bling_id);

-- Tabela para logs de webhooks
CREATE TABLE bling_webhook_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  resource_id VARCHAR(100),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice para event_type
CREATE INDEX idx_bling_webhook_logs_event_type ON bling_webhook_logs(event_type);

-- Criar índice para created_at
CREATE INDEX idx_bling_webhook_logs_created_at ON bling_webhook_logs(created_at);

-- Inserir dados de teste para homologação
INSERT INTO bling_products (nome, codigo, preco, descricao_curta, situacao, tipo, formato) VALUES
('Produto Teste 1', 'TESTE001', 29.90, 'Produto para testes de homologação da API Bling', 'Ativo', 'P', 'S'),
('Produto Teste 2', 'TESTE002', 49.90, 'Segundo produto para validação da integração', 'Ativo', 'P', 'S'),
('Serviço Teste 1', 'TESTE003', 99.90, 'Serviço de teste para homologação', 'Ativo', 'S', 'S'),
('Produto Inativo', 'TESTE004', 19.90, 'Produto inativo para testes', 'Inativo', 'P', 'S'),
('Produto Variação', 'TESTE005', 79.90, 'Produto com variações para testes', 'Ativo', 'P', 'V');

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('bling_auth', 'bling_products', 'bling_webhook_logs')
ORDER BY table_name, ordinal_position;

-- Contar registros inseridos
SELECT 
  'bling_auth' as tabela, COUNT(*) as registros FROM bling_auth
UNION ALL
SELECT 
  'bling_products' as tabela, COUNT(*) as registros FROM bling_products
UNION ALL
SELECT 
  'bling_webhook_logs' as tabela, COUNT(*) as registros FROM bling_webhook_logs;

-- Mostrar produtos inseridos
SELECT id, nome, codigo, preco, situacao FROM bling_products ORDER BY id;
