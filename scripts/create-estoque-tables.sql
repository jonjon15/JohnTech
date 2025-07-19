-- Criação das tabelas de estoque
CREATE TABLE IF NOT EXISTS depositos (
  id SERIAL PRIMARY KEY,
  bling_id INTEGER UNIQUE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  endereco TEXT,
  ativo BOOLEAN DEFAULT true,
  padrao BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES bling_products(id),
  deposito_id INTEGER NOT NULL REFERENCES depositos(id),
  bling_produto_id INTEGER,
  bling_deposito_id INTEGER,
  quantidade_fisica DECIMAL(15,3) DEFAULT 0,
  quantidade_virtual DECIMAL(15,3) DEFAULT 0,
  quantidade_disponivel DECIMAL(15,3) DEFAULT 0,
  quantidade_minima DECIMAL(15,3),
  quantidade_maxima DECIMAL(15,3),
  custo_medio DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  localizacao VARCHAR(255),
  data_ultima_movimentacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(produto_id, deposito_id)
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES bling_products(id),
  deposito_id INTEGER NOT NULL REFERENCES depositos(id),
  tipo_movimentacao VARCHAR(50) NOT NULL CHECK (tipo_movimentacao IN ('ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE', 'INVENTARIO')),
  quantidade DECIMAL(15,3) NOT NULL,
  quantidade_anterior DECIMAL(15,3) NOT NULL,
  quantidade_nova DECIMAL(15,3) NOT NULL,
  custo_unitario DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  motivo VARCHAR(255),
  documento VARCHAR(255),
  usuario_id VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas_estoque (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES bling_products(id),
  deposito_id INTEGER NOT NULL REFERENCES depositos(id),
  tipo_alerta VARCHAR(50) NOT NULL CHECK (tipo_alerta IN ('ESTOQUE_BAIXO', 'ESTOQUE_ZERADO', 'ESTOQUE_NEGATIVO')),
  quantidade_atual DECIMAL(15,3) NOT NULL,
  quantidade_minima DECIMAL(15,3) NOT NULL,
  data_alerta TIMESTAMP NOT NULL,
  resolvido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(produto_id, deposito_id, tipo_alerta)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_estoque_produto_deposito ON estoque(produto_id, deposito_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_estoque(created_at);
CREATE INDEX IF NOT EXISTS idx_alertas_resolvido ON alertas_estoque(resolvido);

-- Inserir depósito padrão se não existir
INSERT INTO depositos (nome, descricao, ativo, padrao)
SELECT 'Depósito Principal', 'Depósito principal da empresa', true, true
WHERE NOT EXISTS (SELECT 1 FROM depositos WHERE padrao = true);
