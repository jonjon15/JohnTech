-- Criação das tabelas de pedidos
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  bling_id INTEGER UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  celular VARCHAR(50),
  documento VARCHAR(50),
  tipo_pessoa CHAR(1) CHECK (tipo_pessoa IN ('F', 'J')),
  inscricao_estadual VARCHAR(50),
  inscricao_municipal VARCHAR(50),
  nome_fantasia VARCHAR(255),
  endereco_logradouro VARCHAR(255),
  endereco_numero VARCHAR(50),
  endereco_complemento VARCHAR(255),
  endereco_bairro VARCHAR(255),
  endereco_cep VARCHAR(20),
  endereco_cidade VARCHAR(255),
  endereco_uf VARCHAR(2),
  endereco_pais VARCHAR(255) DEFAULT 'Brasil',
  observacoes TEXT,
  situacao VARCHAR(50) DEFAULT 'Ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  bling_id INTEGER UNIQUE,
  numero VARCHAR(50),
  numero_loja VARCHAR(50),
  cliente_id INTEGER REFERENCES clientes(id),
  data_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
  data_saida TIMESTAMP,
  data_prevista TIMESTAMP,
  situacao VARCHAR(50) NOT NULL DEFAULT 'Em aberto',
  total_produtos DECIMAL(15,2) DEFAULT 0,
  total_desconto DECIMAL(15,2) DEFAULT 0,
  total_frete DECIMAL(15,2) DEFAULT 0,
  total_geral DECIMAL(15,2) DEFAULT 0,
  observacoes TEXT,
  observacoes_internas TEXT,
  vendedor VARCHAR(255),
  forma_pagamento VARCHAR(255),
  condicao_pagamento VARCHAR(255),
  transportadora VARCHAR(255),
  frete_por_conta VARCHAR(50),
  peso_bruto DECIMAL(10,3),
  quantidade_volumes INTEGER,
  prazo_entrega INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER REFERENCES bling_products(id),
  bling_produto_id INTEGER,
  codigo_produto VARCHAR(255),
  nome_produto VARCHAR(255) NOT NULL,
  quantidade DECIMAL(15,3) NOT NULL,
  valor_unitario DECIMAL(15,2) NOT NULL,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,
  aliquota_ipi DECIMAL(5,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_parcelas (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  forma_pagamento VARCHAR(255),
  observacoes TEXT,
  situacao VARCHAR(50) DEFAULT 'Em aberto',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_historico (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  situacao_anterior VARCHAR(50),
  situacao_nova VARCHAR(50) NOT NULL,
  observacoes TEXT,
  usuario VARCHAR(255),
  data_alteracao TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_situacao ON pedidos(situacao);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_parcelas_pedido ON pedido_parcelas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_historico_pedido ON pedido_historico(pedido_id);
