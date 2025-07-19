-- Tabela de Depósitos
CREATE TABLE IF NOT EXISTS depositos (
    id SERIAL PRIMARY KEY,
    bling_id INTEGER,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    endereco TEXT,
    ativo BOOLEAN DEFAULT true,
    padrao BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Estoque
CREATE TABLE IF NOT EXISTS estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES bling_products(id) ON DELETE CASCADE,
    deposito_id INTEGER NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
    bling_produto_id INTEGER,
    bling_deposito_id INTEGER,
    quantidade_fisica DECIMAL(10,3) DEFAULT 0,
    quantidade_virtual DECIMAL(10,3) DEFAULT 0,
    quantidade_disponivel DECIMAL(10,3) DEFAULT 0,
    quantidade_minima DECIMAL(10,3),
    quantidade_maxima DECIMAL(10,3),
    custo_medio DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(12,2) DEFAULT 0,
    localizacao VARCHAR(50),
    data_ultima_movimentacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(produto_id, deposito_id)
);

-- Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES bling_products(id) ON DELETE CASCADE,
    deposito_id INTEGER NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
    tipo_movimentacao VARCHAR(20) NOT NULL CHECK (tipo_movimentacao IN ('ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE', 'INVENTARIO')),
    quantidade DECIMAL(10,3) NOT NULL,
    quantidade_anterior DECIMAL(10,3) NOT NULL,
    quantidade_nova DECIMAL(10,3) NOT NULL,
    custo_unitario DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(12,2) DEFAULT 0,
    motivo VARCHAR(100),
    documento VARCHAR(50),
    usuario_id VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Alertas de Estoque
CREATE TABLE IF NOT EXISTS alertas_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES bling_products(id) ON DELETE CASCADE,
    deposito_id INTEGER NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(20) NOT NULL CHECK (tipo_alerta IN ('ESTOQUE_BAIXO', 'ESTOQUE_ZERADO', 'ESTOQUE_NEGATIVO')),
    quantidade_atual DECIMAL(10,3) NOT NULL,
    quantidade_minima DECIMAL(10,3) NOT NULL,
    data_alerta TIMESTAMP NOT NULL,
    resolvido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(produto_id, deposito_id, tipo_alerta)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_estoque_produto_deposito ON estoque(produto_id, deposito_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_deposito ON movimentacoes_estoque(deposito_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_estoque(created_at);
CREATE INDEX IF NOT EXISTS idx_alertas_resolvido ON alertas_estoque(resolvido);

-- Inserir depósito padrão
INSERT INTO depositos (nome, descricao, ativo, padrao) 
VALUES ('Depósito Principal', 'Depósito principal da empresa', true, true)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_depositos_updated_at BEFORE UPDATE ON depositos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
