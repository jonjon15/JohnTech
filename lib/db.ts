import { sql } from "@vercel/postgres"

export interface Product {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  bling_id?: string
  created_at: string
  updated_at: string
}

export interface BlingToken {
  id: number
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: number
  event_type: string
  payload: any
  processed: boolean
  created_at: string
}

// Função para verificar conexão com o banco
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as test`
    return result.rows.length > 0
  } catch (error) {
    console.error("❌ Erro na conexão com o banco:", error)
    return false
  }
}

// Função para criar tabelas se não existirem
export async function createTablesIfNotExists(): Promise<boolean> {
  try {
    // Criar tabela de produtos
    await sql`
      CREATE TABLE IF NOT EXISTS bling_products (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL DEFAULT 0,
        estoque INTEGER NOT NULL DEFAULT 0,
        bling_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Criar tabela de tokens
    await sql`
      CREATE TABLE IF NOT EXISTS bling_tokens (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Criar tabela de logs de webhook
    await sql`
      CREATE TABLE IF NOT EXISTS bling_webhook_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    console.log("✅ Tabelas criadas/verificadas com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro ao criar tabelas:", error)
    return false
  }
}

// Funções para produtos
export async function getProducts(): Promise<Product[]> {
  try {
    const result = await sql<Product>`
      SELECT * FROM bling_products 
      ORDER BY created_at DESC
    `
    return result.rows
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error)
    return []
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const result = await sql<Product>`
      SELECT * FROM bling_products 
      WHERE id = ${id}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error)
    return null
  }
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  try {
    const result = await sql<Product>`
      INSERT INTO bling_products (nome, descricao, preco, estoque, bling_id)
      VALUES (${product.nome}, ${product.descricao}, ${product.preco}, ${product.estoque}, ${product.bling_id || null})
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao criar produto:", error)
    return null
  }
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
  try {
    const result = await sql<Product>`
      UPDATE bling_products 
      SET 
        nome = COALESCE(${product.nome}, nome),
        descricao = COALESCE(${product.descricao}, descricao),
        preco = COALESCE(${product.preco}, preco),
        estoque = COALESCE(${product.estoque}, estoque),
        bling_id = COALESCE(${product.bling_id}, bling_id),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao atualizar produto:", error)
    return null
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM bling_products 
      WHERE id = ${id}
    `
    return result.rowCount > 0
  } catch (error) {
    console.error("❌ Erro ao deletar produto:", error)
    return false
  }
}

// Funções para tokens Bling
export async function getBlingTokens(userEmail: string): Promise<BlingToken | null> {
  try {
    const result = await sql<BlingToken>`
      SELECT * FROM bling_tokens 
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao buscar tokens:", error)
    return null
  }
}

// Funções para logs de webhook
export async function createWebhookLog(eventType: string, payload: any): Promise<WebhookLog | null> {
  try {
    const result = await sql<WebhookLog>`
      INSERT INTO bling_webhook_logs (event_type, payload)
      VALUES (${eventType}, ${JSON.stringify(payload)})
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao criar log de webhook:", error)
    return null
  }
}

export async function getWebhookLogs(limit = 50): Promise<WebhookLog[]> {
  try {
    const result = await sql<WebhookLog>`
      SELECT * FROM bling_webhook_logs 
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.rows
  } catch (error) {
    console.error("❌ Erro ao buscar logs de webhook:", error)
    return []
  }
}
