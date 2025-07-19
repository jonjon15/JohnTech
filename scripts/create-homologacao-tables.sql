-- Run this once (e.g. in Vercel Postgres console) to create the table used
-- by lib/db.ts for the homologação environment.

CREATE TABLE IF NOT EXISTS bling_homologacao_produtos (
  id SERIAL PRIMARY KEY,
  nome            VARCHAR(255)      NOT NULL,
  codigo          VARCHAR(100) UNIQUE NOT NULL,
  preco           DECIMAL(10,2)    NOT NULL DEFAULT 0,
  descricao_curta TEXT,
  situacao        VARCHAR(50)      NOT NULL DEFAULT 'Ativo',
  tipo            VARCHAR(10)      NOT NULL DEFAULT 'P',
  formato         VARCHAR(10)      NOT NULL DEFAULT 'S',
  bling_id        VARCHAR(50),
  created_at      TIMESTAMP        DEFAULT NOW(),
  updated_at      TIMESTAMP        DEFAULT NOW()
);
