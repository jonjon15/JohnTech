-- Criar tabelas para integração Bling
-- Executar este script no banco de dados

-- Tabela para armazenar tokens de autenticação OAuth
CREATE TABLE IF NOT EXISTS bling_auth (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice único para user_email
CREATE UNIQUE INDEX IF NOT EXISTS idx_bling_auth_user_email ON bling_auth(user_email);

-- Tabela para produtos do Bling
CREATE TABLE IF NOT EXISTS bling_products (
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_bling_products_codigo ON bling_products(codigo);

-- Criar índice para bling_id
CREATE INDEX IF NOT EXISTS idx_bling_products_bling_id ON bling_products(bling_id);

-- Tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS bling_webhook_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  resource_id VARCHAR(100),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice para event_type
CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_event_type ON bling_webhook_logs(event_type);

-- Criar índice para created_at
CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_created_at ON bling_webhook_logs(created_at);

-- Tabela de tokens de autenticação
CREATE TABLE IF NOT EXISTS bling_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_in INTEGER,
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  bling_id VARCHAR(255),
  codigo VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(500) NOT NULL,
  descricao TEXT,
  preco DECIMAL(15,2) DEFAULT 0,
  categoria VARCHAR(255),
  situacao VARCHAR(50) DEFAULT 'Ativo',
  tipo VARCHAR(10) DEFAULT 'P',
  formato VARCHAR(10) DEFAULT 'S',
  descricao_complementar TEXT,
  unidade VARCHAR(10) DEFAULT 'un',
  peso_liquido DECIMAL(10,3),
  peso_bruto DECIMAL(10,3),
  volumes INTEGER,
  itens_por_caixa INTEGER,
  gtin VARCHAR(50),
  gtin_embalagem VARCHAR(50),
  marca VARCHAR(255),
  cest VARCHAR(20),
  ncm VARCHAR(20),
  origem VARCHAR(10) DEFAULT '0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  bling_id VARCHAR(255),
  nome VARCHAR(500) NOT NULL,
  fantasia VARCHAR(500),
  tipo VARCHAR(20) DEFAULT 'F',
  cpf_cnpj VARCHAR(20),
  ie VARCHAR(50),
  rg VARCHAR(50),
  email VARCHAR(255),
  telefone VARCHAR(50),
  celular VARCHAR(50),
  cep VARCHAR(10),
  endereco VARCHAR(500),
  numero VARCHAR(20),
  complemento VARCHAR(255),
  bairro VARCHAR(255),
  cidade VARCHAR(255),
  uf VARCHAR(2),
  pais VARCHAR(100) DEFAULT 'Brasil',
  situacao VARCHAR(50) DEFAULT 'Ativo',
  contribuinte VARCHAR(10) DEFAULT '9',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  bling_id VARCHAR(255),
  numero VARCHAR(255),
  data_pedido TIMESTAMP DEFAULT NOW(),
  data_prevista TIMESTAMP,
  cliente_id INTEGER REFERENCES clientes(id),
  cliente_nome VARCHAR(500),
  vendedor VARCHAR(255),
  situacao VARCHAR(50) DEFAULT 'Em aberto',
  total_produtos DECIMAL(15,2) DEFAULT 0,
  total_venda DECIMAL(15,2) DEFAULT 0,
  total_desconto DECIMAL(15,2) DEFAULT 0,
  total_geral DECIMAL(15,2) DEFAULT 0,
  observacoes TEXT,
  observacoes_internas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER REFERENCES produtos(id),
  bling_produto_id VARCHAR(255),
  codigo_produto VARCHAR(255),
  nome_produto VARCHAR(500),
  quantidade DECIMAL(10,3) DEFAULT 1,
  valor_unitario DECIMAL(15,2) DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
  bling_produto_id VARCHAR(255),
  deposito_id INTEGER DEFAULT 1,
  deposito_nome VARCHAR(255) DEFAULT 'Principal',
  quantidade_fisica DECIMAL(10,3) DEFAULT 0,
  quantidade_disponivel DECIMAL(10,3) DEFAULT 0,
  quantidade_reservada DECIMAL(10,3) DEFAULT 0,
  quantidade_pendente DECIMAL(10,3) DEFAULT 0,
  quantidade_minima DECIMAL(10,3) DEFAULT 0,
  quantidade_maxima DECIMAL(10,3) DEFAULT 0,
  custo_medio DECIMAL(15,2) DEFAULT 0,
  custo_ultimo DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(produto_id, deposito_id)
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER REFERENCES produtos(id),
  deposito_id INTEGER DEFAULT 1,
  tipo VARCHAR(50) NOT NULL,
  operacao VARCHAR(20) NOT NULL CHECK (operacao IN ('E', 'S')),
  quantidade DECIMAL(10,3) NOT NULL,
  valor_unitario DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  documento VARCHAR(255),
  observacoes TEXT,
  data_movimentacao TIMESTAMP DEFAULT NOW(),
  usuario VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de sincronização
CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  acao VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  dados_enviados JSONB,
  dados_recebidos JSONB,
  erro TEXT,
  tentativas INTEGER DEFAULT 0,
  max_tentativas INTEGER DEFAULT 3,
  proxima_tentativa TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks_log (
  id SERIAL PRIMARY KEY,
  evento VARCHAR(100) NOT NULL,
  dados JSONB NOT NULL,
  processado BOOLEAN DEFAULT FALSE,
  erro TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_bling_id ON produtos(bling_id);
CREATE INDEX IF NOT EXISTS idx_produtos_situacao ON produtos(situacao);

CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_bling_id ON clientes(bling_id);
CREATE INDEX IF NOT EXISTS idx_clientes_situacao ON clientes(situacao);

CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero);
CREATE INDEX IF NOT EXISTS idx_pedidos_bling_id ON pedidos(bling_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_situacao ON pedidos(situacao);

CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_produto_id ON pedido_itens(produto_id);

CREATE INDEX IF NOT EXISTS idx_estoque_produto_id ON estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_deposito_id ON estoque(deposito_id);

CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_produto_id ON estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_data ON estoque_movimentacoes(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_tipo ON estoque_movimentacoes(tipo);

CREATE INDEX IF NOT EXISTS idx_sync_log_tipo ON sync_log(tipo);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON sync_log(created_at);

CREATE INDEX IF NOT EXISTS idx_webhooks_log_evento ON webhooks_log(evento);
CREATE INDEX IF NOT EXISTS idx_webhooks_log_processado ON webhooks_log(processado);
CREATE INDEX IF NOT EXISTS idx_webhooks_log_created_at ON webhooks_log(created_at);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON estoque
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bling_tokens_updated_at BEFORE UPDATE ON bling_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_log_updated_at BEFORE UPDATE ON sync_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de teste para homologação
DO $$
BEGIN
  -- Verificar se já existem produtos de teste
  IF NOT EXISTS (SELECT 1 FROM bling_products WHERE codigo LIKE 'TESTE%') THEN
    
    INSERT INTO bling_products (nome, codigo, preco, descricao_curta, situacao, tipo, formato) VALUES
    ('Produto Teste 1', 'TESTE001', 29.90, 'Produto para testes de homologação da API Bling', 'Ativo', 'P', 'S'),
    ('Produto Teste 2', 'TESTE002', 49.90, 'Segundo produto para validação da integração', 'Ativo', 'P', 'S'),
    ('Serviço Teste 1', 'TESTE003', 99.90, 'Serviço de teste para homologação', 'Ativo', 'S', 'S'),
    ('Produto Inativo', 'TESTE004', 19.90, 'Produto inativo para testes', 'Inativo', 'P', 'S'),
    ('Produto Variação', 'TESTE005', 79.90, 'Produto com variações para testes', 'Ativo', 'P', 'V');
    
    RAISE NOTICE 'Produtos de teste inseridos com sucesso!';
  ELSE
    RAISE NOTICE 'Produtos de teste já existem, pulando inserção.';
  END IF;
END $$;

-- Inserir dados iniciais se necessário
INSERT INTO bling_tokens (access_token, refresh_token, token_type, expires_in, scope)
SELECT 'placeholder', 'placeholder', 'Bearer', 3600, 'read write'
WHERE NOT EXISTS (SELECT 1 FROM bling_tokens);

-- Verificar estrutura das tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('bling_auth', 'bling_products', 'bling_webhook_logs', 'bling_tokens', 'produtos', 'clientes', 'pedidos', 'pedido_itens', 'estoque', 'estoque_movimentacoes', 'sync_log', 'webhooks_log')
ORDER BY table_name, ordinal_position;

-- Contar registros inseridos
SELECT 
  'bling_auth' as tabela, COUNT(*) as registros FROM bling_auth
UNION ALL
SELECT 
  'bling_products' as tabela, COUNT(*) as registros FROM bling_products
UNION ALL
SELECT 
  'bling_webhook_logs' as tabela, COUNT(*) as registros FROM bling_webhook_logs
UNION ALL
SELECT 
  'bling_tokens' as tabela, COUNT(*) as registros FROM bling_tokens
UNION ALL
SELECT 
  'produtos' as tabela, COUNT(*) as registros FROM produtos
UNION ALL
SELECT 
  'clientes' as tabela, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 
  'pedidos' as tabela, COUNT(*) as registros FROM pedidos
UNION ALL
SELECT 
  'pedido_itens' as tabela, COUNT(*) as registros FROM pedido_itens
UNION ALL
SELECT 
  'estoque' as tabela, COUNT(*) as registros FROM estoque
UNION ALL
SELECT 
  'estoque_movimentacoes' as tabela, COUNT(*) as registros FROM estoque_movimentacoes
UNION ALL
SELECT 
  'sync_log' as tabela, COUNT(*) as registros FROM sync_log
UNION ALL
SELECT 
  'webhooks_log' as tabela, COUNT(*) as registros FROM webhooks_log;

-- Comentários nas tabelas
COMMENT ON TABLE produtos IS 'Tabela de produtos sincronizados com o Bling';
COMMENT ON TABLE clientes IS 'Tabela de clientes sincronizados com o Bling';
COMMENT ON TABLE pedidos IS 'Tabela de pedidos de venda sincronizados com o Bling';
COMMENT ON TABLE pedido_itens IS 'Tabela de itens dos pedidos de venda';
COMMENT ON TABLE estoque IS 'Tabela de controle de estoque por produto e depósito';
COMMENT ON TABLE estoque_movimentacoes IS 'Tabela de movimentações de estoque';
COMMENT ON TABLE sync_log IS 'Log de sincronizações com a API do Bling';
COMMENT ON TABLE webhooks_log IS 'Log de webhooks recebidos do Bling';
COMMENT ON TABLE bling_tokens IS 'Tokens de autenticação OAuth2 do Bling';
