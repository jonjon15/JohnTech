-- Tabelas para relatórios e analytics
CREATE TABLE IF NOT EXISTS relatorios_vendas (
  id SERIAL PRIMARY KEY,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  total_vendas DECIMAL(15,2) DEFAULT 0,
  total_pedidos INTEGER DEFAULT 0,
  ticket_medio DECIMAL(15,2) DEFAULT 0,
  produtos_vendidos INTEGER DEFAULT 0,
  clientes_ativos INTEGER DEFAULT 0,
  vendedor VARCHAR(255),
  categoria VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metricas_diarias (
  id SERIAL PRIMARY KEY,
  data_referencia DATE NOT NULL UNIQUE,
  vendas_total DECIMAL(15,2) DEFAULT 0,
  pedidos_total INTEGER DEFAULT 0,
  pedidos_novos INTEGER DEFAULT 0,
  pedidos_faturados INTEGER DEFAULT 0,
  pedidos_cancelados INTEGER DEFAULT 0,
  clientes_novos INTEGER DEFAULT 0,
  produtos_vendidos INTEGER DEFAULT 0,
  ticket_medio DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas_sistema (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  severidade VARCHAR(20) DEFAULT 'INFO' CHECK (severidade IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_resolucao TIMESTAMP,
  usuario_responsavel VARCHAR(255),
  metadados JSONB
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_relatorios_vendas_periodo ON relatorios_vendas(periodo_inicio, periodo_fim);
CREATE INDEX IF NOT EXISTS idx_metricas_diarias_data ON metricas_diarias(data_referencia);
CREATE INDEX IF NOT EXISTS idx_alertas_sistema_tipo ON alertas_sistema(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_sistema_lido ON alertas_sistema(lido);
