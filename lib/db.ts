import { Pool } from "pg"

declare global {
  // Evita recriar o pool em hot-reload no dev
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

// Variável global para armazenar o pool de conexões
const _pool: Pool | null = null

/**
 * Retorna uma instância singleton do Pool.
 */
export function getPool() {
  if (!global._pgPool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL não definida nas variáveis de ambiente")
    }
    global._pgPool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
    })

    // Log de erro para facilitar depuração em produção
    global._pgPool.on("error", (err) => {
      console.error("🐘  Erro no pool PostgreSQL:", err)
    })
  }
  return global._pgPool
}

/**
 * Consulta a tabela bling_tokens pelo e-mail do usuário
 */
export async function getBlingTokens(userEmail: string) {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT * FROM bling_tokens WHERE user_email = $1 ORDER BY updated_at DESC LIMIT 1`,
    [userEmail],
  )
  return rows[0] ?? null
}

// Interfaces
export interface Product {
  id: number
  bling_id?: number
  nome: string
  codigo: string
  preco: number
  descricao?: string
  categoria?: string
  unidade?: string
  peso_bruto?: number
  peso_liquido?: number
  gtin?: string
  gtinEmbalagem?: string
  tipoProducao?: string
  condicao?: number
  freteGratis?: boolean
  marca?: string
  descricaoComplementar?: string
  linkExterno?: string
  observacoes?: string
  descricaoEmbalagemDiscreta?: string
  created_at?: Date
  updated_at?: Date
  quantidade_minima?: number
  descricao_curta?: string
  situacao: string
  tipo: string
  formato: string
}

export interface BlingToken {
  id?: number
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: Date
  created_at?: Date
  updated_at?: Date
}

export interface WebhookLog {
  id?: number
  event_type: string
  resource_id: string
  data: any
  processed: boolean
  created_at?: Date
}

// Funções para produtos
export async function getAllProducts(): Promise<Product[]> {
  const pool = getPool()
  try {
    const result = await pool.query(`
      SELECT * FROM bling_products ORDER BY nome
    `)
    return result.rows.map(normalizeProduct)
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    throw error
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `
      SELECT * FROM bling_products WHERE id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return normalizeProduct(result.rows[0])
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error)
    throw error
  }
}

export async function getProductByBlingId(blingId: number): Promise<Product | null> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `
      SELECT * FROM bling_products WHERE bling_id = $1
    `,
      [blingId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return normalizeProduct(result.rows[0])
  } catch (error) {
    console.error("Erro ao buscar produto por Bling ID:", error)
    throw error
  }
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `
      INSERT INTO bling_products (
        bling_id, nome, codigo, preco, descricao, categoria, unidade,
        peso_bruto, peso_liquido, gtin, gtinEmbalagem, tipoProducao,
        condicao, freteGratis, marca, descricaoComplementar, linkExterno,
        observacoes, descricaoEmbalagemDiscreta, quantidade_minima, descricao_curta, situacao, tipo, formato
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `,
      [
        product.bling_id || null,
        product.nome,
        product.codigo,
        product.preco,
        product.descricao || null,
        product.categoria || null,
        product.unidade || null,
        product.peso_bruto || null,
        product.peso_liquido || null,
        product.gtin || null,
        product.gtinEmbalagem || null,
        product.tipoProducao || null,
        product.condicao || null,
        product.freteGratis || false,
        product.marca || null,
        product.descricaoComplementar || null,
        product.linkExterno || null,
        product.observacoes || null,
        product.descricaoEmbalagemDiscreta || null,
        product.quantidade_minima || null,
        product.descricao_curta || null,
        product.situacao,
        product.tipo,
        product.formato,
      ],
    )
    return normalizeProduct(result.rows[0])
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    throw error
  }
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
  const pool = getPool()
  try {
    const fields = []
    const values = []
    let paramCount = 1

    Object.entries(product).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && key !== "updated_at" && value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) {
      throw new Error("Nenhum campo para atualizar")
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE bling_products
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      throw new Error("Produto não encontrado")
    }

    return normalizeProduct(result.rows[0])
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    throw error
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `
      DELETE FROM bling_products WHERE id = $1
    `,
      [id],
    )

    return result.rowCount > 0
  } catch (error) {
    console.error("Erro ao deletar produto:", error)
    throw error
  }
}

// Funções para webhooks
export async function logWebhook(eventType: string, resourceId: string, data: any): Promise<void> {
  const pool = getPool()
  try {
    await pool.query(
      `
      INSERT INTO webhook_logs (event_type, resource_id, data, processed)
      VALUES ($1, $2, $3, false)
    `,
      [eventType, resourceId, JSON.stringify(data)],
    )
  } catch (error) {
    console.error("Erro ao registrar webhook:", error)
    throw error
  }
}

export async function getWebhookLogs(limit = 50): Promise<WebhookLog[]> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `
      SELECT * FROM webhook_logs
      ORDER BY created_at DESC
      LIMIT $1
    `,
      [limit],
    )

    return result.rows
  } catch (error) {
    console.error("Erro ao buscar logs de webhook:", error)
    throw error
  }
}

// Funções de utilidade
export async function testConnection(): Promise<{ success: boolean; timestamp?: Date; error?: string }> {
  const pool = getPool()
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    client.release()
    return { success: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error("Erro na conexão com o banco:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}

export async function queryWithRetry(text: string, params?: any[], maxRetries = 3) {
  const pool = getPool()
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(text, params)
      return result
    } catch (error) {
      lastError = error as Error
      console.error(`Tentativa ${attempt}/${maxRetries} falhou:`, error)

      if (attempt < maxRetries) {
        // Aguarda antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw lastError
}

export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await getPool().connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export async function initializeTables(): Promise<void> {
  const pool = getPool()
  try {
    // Criar tabelas se não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bling_products (
        id SERIAL PRIMARY KEY,
        bling_id INTEGER UNIQUE,
        nome VARCHAR(255) NOT NULL,
        codigo VARCHAR(100) NOT NULL UNIQUE,
        preco DECIMAL(10,2) NOT NULL DEFAULT 0,
        descricao TEXT,
        categoria VARCHAR(100),
        unidade VARCHAR(10),
        peso_bruto DECIMAL(8,3),
        peso_liquido DECIMAL(8,3),
        gtin VARCHAR(20),
        gtinEmbalagem VARCHAR(20),
        tipoProducao VARCHAR(1),
        condicao INTEGER,
        freteGratis BOOLEAN DEFAULT false,
        marca VARCHAR(100),
        descricaoComplementar TEXT,
        linkExterno VARCHAR(500),
        observacoes TEXT,
        descricaoEmbalagemDiscreta TEXT,
        quantidade_minima DECIMAL(10,3),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        descricao_curta TEXT,
        situacao VARCHAR(50),
        tipo VARCHAR(50),
        formato VARCHAR(50)
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bling_tokens (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  } catch (error) {
    console.error("Erro ao inicializar tabelas:", error)
    throw error
  }
}

// Função de normalização
function normalizeProduct(row: any): Product {
  return {
    ...row,
    preco: typeof row.preco === "string" ? Number.parseFloat(row.preco) : row.preco,
  }
}

// --- exports exigidos pelo sistema ---
const poolInstance = getPool()
export default poolInstance // default export chamado "pool"

// Aliases exigidos pelo deploy (Vercel build)
export { logWebhook as createWebhookLog }
export { testConnection as checkDatabaseConnection }
export { initializeTables as createTablesIfNotExists }
