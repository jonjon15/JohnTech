import { sql as vercelSql } from "@vercel/postgres"

/**
 * Re-export the tagged-template helper from @vercel/postgres
 * so other modules can simply write:
 *   import { sql } from "@/lib/db"
 */
export const sql = vercelSql

/* ---------- Domain types ---------- */
export interface BlingProduct {
  id: number
  nome: string
  codigo: string
  preco: number
  descricao_curta: string | null
  situacao: string
  tipo: string
  formato: string
  bling_id: string | null
  estoque: number | null
  created_at: string
  updated_at: string
}

/* ---------- Schema helpers ---------- */
export async function ensureHomologacaoTables() {
  await sql /*sql*/`
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
      estoque         DECIMAL(10,2),
      created_at      TIMESTAMP        DEFAULT NOW(),
      updated_at      TIMESTAMP        DEFAULT NOW()
    );
  `
}

/* ---------- CRUD helpers ---------- */
export async function listProducts(): Promise<BlingProduct[]> {
  const { rows } = await sql<BlingProduct>`SELECT * FROM bling_homologacao_produtos ORDER BY created_at DESC`
  return rows
}

export async function getProduct(id: number): Promise<BlingProduct | null> {
  const { rows } = await sql<BlingProduct>`SELECT * FROM bling_homologacao_produtos WHERE id = ${id}`
  return rows[0] ?? null
}

export async function createProduct(data: Omit<BlingProduct, "id" | "created_at" | "updated_at">) {
  const { rows } = await sql<BlingProduct>`
    INSERT INTO bling_homologacao_produtos
      (nome, codigo, preco, descricao_curta, situacao, tipo, formato, bling_id, estoque)
    VALUES
      (${data.nome}, ${data.codigo}, ${data.preco}, ${data.descricao_curta},
       ${data.situacao}, ${data.tipo}, ${data.formato}, ${data.bling_id}, ${data.estoque ?? null})
    RETURNING *;
  `
  return rows[0]
}

export async function updateProduct(id: number, updates: Partial<BlingProduct>) {
  const { rows } = await sql<BlingProduct>`
    UPDATE bling_homologacao_produtos SET
      nome            = COALESCE(${updates.nome}, nome),
      codigo          = COALESCE(${updates.codigo}, codigo),
      preco           = COALESCE(${updates.preco}, preco),
      descricao_curta = COALESCE(${updates.descricao_curta}, descricao_curta),
      situacao        = COALESCE(${updates.situacao}, situacao),
      tipo            = COALESCE(${updates.tipo}, tipo),
      formato         = COALESCE(${updates.formato}, formato),
      bling_id        = COALESCE(${updates.bling_id}, bling_id),
      estoque         = COALESCE(${updates.estoque}, estoque),
      updated_at      = NOW()
    WHERE id = ${id}
    RETURNING *;
  `
  return rows[0] ?? null
}

export async function removeProduct(id: number) {
  const { rowCount } = await sql`DELETE FROM bling_homologacao_produtos WHERE id = ${id}`
  return (rowCount ?? 0) > 0
}
