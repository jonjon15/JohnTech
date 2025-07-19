import { Pool } from "pg"
import type { BlingTokenData } from "@/types/bling"

let pool: Pool | null = null

/**
 * Retorna uma instância singleton do pool de conexões PostgreSQL
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
    })

    console.log("✅ Database pool initialized")
  }

  return pool
}

/**
 * Cria as tabelas necessárias se elas não existirem
 */
export async function createTablesIfNotExists(): Promise<void> {
  const pool = getPool()

  try {
    // Tabela de tokens do Bling
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

    // Tabela de produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        bling_id BIGINT UNIQUE NOT NULL,
        nome VARCHAR(500) NOT NULL,
        codigo VARCHAR(100),
        preco DECIMAL(10,2),
        tipo VARCHAR(1) DEFAULT 'P',
        situacao VARCHAR(1) DEFAULT 'A',
        descricao_curta TEXT,
        descricao_complementar TEXT,
        unidade VARCHAR(10),
        peso_liquido DECIMAL(8,3),
        peso_bruto DECIMAL(8,3),
        gtin VARCHAR(20),
        ncm VARCHAR(10),
        categoria_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Tabela de estoque
    await pool.query(`
      CREATE TABLE IF NOT EXISTS estoque (
        id SERIAL PRIMARY KEY,
        produto_id INTEGER REFERENCES produtos(id),
        bling_produto_id BIGINT NOT NULL,
        deposito_id INTEGER DEFAULT 1,
        quantidade DECIMAL(10,3) DEFAULT 0,
        saldo_virtual_total DECIMAL(10,3) DEFAULT 0,
        saldo_fisico_total DECIMAL(10,3) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(bling_produto_id, deposito_id)
      )
    `)

    // Tabela de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        bling_id BIGINT UNIQUE NOT NULL,
        numero VARCHAR(50) NOT NULL,
        numero_loja VARCHAR(50),
        data_pedido TIMESTAMP NOT NULL,
        data_saida TIMESTAMP,
        total_venda DECIMAL(10,2) NOT NULL,
        situacao VARCHAR(50) DEFAULT 'Em aberto',
        cliente_nome VARCHAR(255),
        cliente_email VARCHAR(255),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Tabela de itens do pedido
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedido_itens (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id),
        produto_id INTEGER REFERENCES produtos(id),
        bling_produto_id BIGINT NOT NULL,
        quantidade DECIMAL(10,3) NOT NULL,
        valor_unitario DECIMAL(10,2) NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Tabela de webhooks recebidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP
      )
    `)

    // Tabela de logs de sincronização
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        sync_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        message TEXT,
        records_processed INTEGER DEFAULT 0,
        errors_count INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `)

    console.log("✅ All database tables created/verified successfully")
  } catch (error) {
    console.error("❌ Error creating database tables:", error)
    throw error
  }
}

/**
 * Função para obter tokens do Bling (alias para compatibilidade)
 */
export async function getBlingTokens(userEmail: string): Promise<BlingTokenData | null> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `SELECT access_token, refresh_token, expires_at
       FROM bling_tokens
       WHERE user_email = $1`,
      [userEmail],
    )

    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at.toISOString(),
        expiresIn: 0,
        tokenType: "Bearer",
        scope: "",
      }
    }
    return null
  } catch (error) {
    console.error("❌ Error fetching Bling tokens:", error)
    return null
  }
}

// Export default do pool para compatibilidade
export default getPool()
