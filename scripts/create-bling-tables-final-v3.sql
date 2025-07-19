-- Criação das tabelas para integração com Bling API v3
-- Baseado em: https://developer.bling.com.br/

-- Tabela de tokens de autenticação OAuth 2.0
CREATE TABLE IF NOT EXISTS bling_auth_tokens (
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

-- Tabela de produtos sincronizados do Bling
CREATE TABLE IF NOT EXISTS bling_produtos (
    id SERIAL PRIMARY KEY,
    bling_id BIGINT UNIQUE NOT NULL,
    codigo VARCHAR(100),
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2),
    preco_custo DECIMAL(10,2),
    unidade VARCHAR(10),
    peso_liquido DECIMAL(10,3),
    peso_bruto DECIMAL(10,3),
    volumes INTEGER,
    itens_por_caixa INTEGER,
    gtin VARCHAR(50),
    gtin_embalagem VARCHAR(50),
    tipo VARCHAR(50),
    situacao VARCHAR(20) DEFAULT 'Ativo',
    formato VARCHAR(20),
    descricao_curta TEXT,
    descricao_complementar TEXT,
    link_externo TEXT,
    observacoes TEXT,
    categoria_id INTEGER,
    estoque_minimo DECIMAL(10,2),
    estoque_maximo DECIMAL(10,2),
    estoque_crossdocking DECIMAL(10,2),
    estoque_localizacao VARCHAR(100),
    dimensoes JSONB,
    tributacao JSONB,
    midia JSONB,
    loja_virtual JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos sincronizados do Bling
CREATE TABLE IF NOT EXISTS bling_pedidos (
    id SERIAL PRIMARY KEY,
    bling_id BIGINT UNIQUE NOT NULL,
    numero BIGINT,
    numero_loja VARCHAR(50),
    data_pedido TIMESTAMP,
    data_prevista TIMESTAMP,
    total_produtos DECIMAL(10,2),
    total_venda DECIMAL(10,2),
    situacao_id INTEGER,
    situacao_nome VARCHAR(100),
    loja_id INTEGER,
    numero_ordem_compra VARCHAR(100),
    outras_despesas DECIMAL(10,2),
    observacoes TEXT,
    observacoes_internas TEXT,
    desconto JSONB,
    categoria JSONB,
    tributacao JSONB,
    contato JSONB,
    vendedor JSONB,
    intermediador JSONB,
    transporte JSONB,
    itens JSONB,
    parcelas JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contatos/clientes sincronizados do Bling
CREATE TABLE IF NOT EXISTS bling_contatos (
    id SERIAL PRIMARY KEY,
    bling_id BIGINT UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(100),
    fantasia VARCHAR(255),
    tipo VARCHAR(20),
    contribuinte INTEGER,
    cpf_cnpj VARCHAR(20),
    ie_rg VARCHAR(50),
    endereco JSONB,
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(255),
    site VARCHAR(255),
    situacao VARCHAR(20) DEFAULT 'Ativo',
    nascimento_fundacao DATE,
    limite_credito DECIMAL(10,2),
    cliente_desde DATE,
    observacoes TEXT,
    tags JSONB,
    vendedor JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de estoque por depósito
CREATE TABLE IF NOT EXISTS bling_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES bling_produtos(id),
    produto_bling_id BIGINT NOT NULL,
    deposito_id INTEGER,
    deposito_nome VARCHAR(255),
    saldo_fisico DECIMAL(10,2) DEFAULT 0,
    saldo_virtual DECIMAL(10,2) DEFAULT 0,
    saldo_virtual_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(produto_bling_id, deposito_id)
);

-- Tabela de logs de webhooks
CREATE TABLE IF NOT EXISTS bling_webhook_logs (
    id SERIAL PRIMARY KEY,
    evento VARCHAR(50) NOT NULL,
    ocorrencia VARCHAR(50) NOT NULL,
    data_evento TIMESTAMP NOT NULL,
    payload JSONB NOT NULL,
    processado BOOLEAN DEFAULT FALSE,
    erro TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações da integração
CREATE TABLE IF NOT EXISTS bling_configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bling_produtos_bling_id ON bling_produtos(bling_id);
CREATE INDEX IF NOT EXISTS idx_bling_produtos_codigo ON bling_produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_bling_produtos_situacao ON bling_produtos(situacao);

CREATE INDEX IF NOT EXISTS idx_bling_pedidos_bling_id ON bling_pedidos(bling_id);
CREATE INDEX IF NOT EXISTS idx_bling_pedidos_numero ON bling_pedidos(numero);
CREATE INDEX IF NOT EXISTS idx_bling_pedidos_data ON bling_pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_bling_pedidos_situacao ON bling_pedidos(situacao_id);

CREATE INDEX IF NOT EXISTS idx_bling_contatos_bling_id ON bling_contatos(bling_id);
CREATE INDEX IF NOT EXISTS idx_bling_contatos_cpf_cnpj ON bling_contatos(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_bling_contatos_email ON bling_contatos(email);

CREATE INDEX IF NOT EXISTS idx_bling_estoque_produto ON bling_estoque(produto_bling_id);
CREATE INDEX IF NOT EXISTS idx_bling_estoque_deposito ON bling_estoque(deposito_id);

CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_evento ON bling_webhook_logs(evento);
CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_processado ON bling_webhook_logs(processado);
CREATE INDEX IF NOT EXISTS idx_bling_webhook_logs_data ON bling_webhook_logs(data_evento);

-- Inserir configurações padrão
INSERT INTO bling_configuracoes (chave, valor, descricao) VALUES
('webhook_secret', '09cd0c191a2d7d849609870b9166ab3b74e76ba95df54f0237bce24fb2af1e8b', 'Chave secreta para validação de webhooks'),
('api_base_url', 'https://www.bling.com.br/Api/v3', 'URL base da API do Bling v3'),
('sync_interval', '300', 'Intervalo de sincronização em segundos'),
('max_retries', '3', 'Número máximo de tentativas para requisições')
ON CONFLICT (chave) DO NOTHING;

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bling_produtos_updated_at BEFORE UPDATE ON bling_produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bling_pedidos_updated_at BEFORE UPDATE ON bling_pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bling_contatos_updated_at BEFORE UPDATE ON bling_contatos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bling_estoque_updated_at BEFORE UPDATE ON bling_estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bling_auth_tokens_updated_at BEFORE UPDATE ON bling_auth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bling_configuracoes_updated_at BEFORE UPDATE ON bling_configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
