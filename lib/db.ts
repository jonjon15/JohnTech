import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface BlingProduct {
  id: number
  bling_id: string | null
  nome: string
  codigo: string
  preco: number
  descricao_curta: string | null
  situacao: string
  tipo: string
  formato: string
  created_at: string
  updated_at: string
}

export interface BlingAuth {
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
  resource_id: string | null
  processed: boolean
  created_at: string
}

// Função para testar conexão
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as timestamp`
    return { success: true, timestamp: result[0].timestamp }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Funções para produtos
export async function getAllProducts(): Promise<BlingProduct[]> {
  try {
    const products = await sql`
      SELECT 
        id,
        bling_id,
        nome,
        codigo,
        preco,
        descricao_curta,
        situacao,
        tipo,
        formato,
        created_at,
        updated_at
      FROM bling_products 
      ORDER BY created_at DESC
    `

    return products as BlingProduct[]
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function getProductById(id: number): Promise<BlingProduct | null> {
  try {
    const result = await sql`
      SELECT 
        id,
        bling_id,
        nome,
        codigo,
        preco,
        descricao_curta,
        situacao,
        tipo,
        formato,
        created_at,
        updated_at
      FROM bling_products 
      WHERE id = ${id}
    `
    return (result[0] as BlingProduct) || null
  } catch (error) {
    console.error("Error fetching product by id:", error)
    throw error
  }
}

export async function getProductByCode(codigo: string): Promise<BlingProduct | null> {
  try {
    const result = await sql`
      SELECT 
        id,
        bling_id,
        nome,
        codigo,
        preco,
        descricao_curta,
        situacao,
        tipo,
        formato,
        created_at,
        updated_at
      FROM bling_products 
      WHERE codigo = ${codigo}
    `
    return (result[0] as BlingProduct) || null
  } catch (error) {
    console.error("Error fetching product by code:", error)
    throw error
  }
}

export async function createProduct(
  product: Omit<BlingProduct, "id" | "created_at" | "updated_at">,
): Promise<BlingProduct> {
  try {
    const result = await sql`
      INSERT INTO bling_products (
        bling_id, 
        nome, 
        codigo, 
        preco, 
        descricao_curta, 
        situacao, 
        tipo, 
        formato
      )
      VALUES (
        ${product.bling_id || null},
        ${product.nome},
        ${product.codigo},
        ${product.preco},
        ${product.descricao_curta || null},
        ${product.situacao || "Ativo"},
        ${product.tipo || "P"},
        ${product.formato || "S"}
      )
      RETURNING 
        id,
        bling_id,
        nome,
        codigo,
        preco,
        descricao_curta,
        situacao,
        tipo,
        formato,
        created_at,
        updated_at
    `
    return result[0] as BlingProduct
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: number, product: Partial<BlingProduct>): Promise<BlingProduct | null> {
  try {
    const fields = []
    const values = []

    if (product.bling_id !== undefined) {
      fields.push("bling_id")
      values.push(product.bling_id)
    }
    if (product.nome !== undefined) {
      fields.push("nome")
      values.push(product.nome)
    }
    if (product.codigo !== undefined) {
      fields.push("codigo")
      values.push(product.codigo)
    }
    if (product.preco !== undefined) {
      fields.push("preco")
      values.push(product.preco)
    }
    if (product.descricao_curta !== undefined) {
      fields.push("descricao_curta")
      values.push(product.descricao_curta)
    }
    if (product.situacao !== undefined) {
      fields.push("situacao")
      values.push(product.situacao)
    }
    if (product.tipo !== undefined) {
      fields.push("tipo")
      values.push(product.tipo)
    }
    if (product.formato !== undefined) {
      fields.push("formato")
      values.push(product.formato)
    }

    if (fields.length === 0) {
      throw new Error("No fields to update")
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ")
    values.push(id)

    const result = await sql`
      UPDATE bling_products 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id,
        bling_id,
        nome,
        codigo,
        preco,
        descricao_curta,
        situacao,
        tipo,
        formato,
        created_at,
        updated_at
    `

    return (result[0] as BlingProduct) || null
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const result = await sql`DELETE FROM bling_products WHERE id = ${id}`
    return result.count > 0
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Funções para autenticação
export async function saveAuthTokens(auth: Omit<BlingAuth, "id" | "created_at" | "updated_at">): Promise<BlingAuth> {
  try {
    const result = await sql`
      INSERT INTO bling_auth (user_email, access_token, refresh_token, expires_at)
      VALUES (${auth.user_email}, ${auth.access_token}, ${auth.refresh_token}, ${auth.expires_at})
      ON CONFLICT (user_email) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
      RETURNING id, user_email, access_token, refresh_token, expires_at, created_at, updated_at
    `
    return result[0] as BlingAuth
  } catch (error) {
    console.error("Error saving auth tokens:", error)
    throw error
  }
}

export async function getAuthTokens(userEmail: string): Promise<BlingAuth | null> {
  try {
    const result = await sql`
      SELECT id, user_email, access_token, refresh_token, expires_at, created_at, updated_at
      FROM bling_auth 
      WHERE user_email = ${userEmail}
    `
    return (result[0] as BlingAuth) || null
  } catch (error) {
    console.error("Error fetching auth tokens:", error)
    throw error
  }
}

export async function deleteAuthTokens(userEmail: string): Promise<boolean> {
  try {
    const result = await sql`DELETE FROM bling_auth WHERE user_email = ${userEmail}`
    return result.count > 0
  } catch (error) {
    console.error("Error deleting auth tokens:", error)
    throw error
  }
}

// Funções para webhook logs
export async function logWebhookEvent(log: Omit<WebhookLog, "id" | "created_at">): Promise<WebhookLog> {
  try {
    const result = await sql`
      INSERT INTO bling_webhook_logs (event_type, payload, resource_id, processed)
      VALUES (${log.event_type}, ${JSON.stringify(log.payload)}, ${log.resource_id || null}, ${log.processed || false})
      RETURNING id, event_type, payload, resource_id, processed, created_at
    `
    return result[0] as WebhookLog
  } catch (error) {
    console.error("Error logging webhook event:", error)
    throw error
  }
}

export async function getWebhookLogs(limit = 50): Promise<WebhookLog[]> {
  try {
    const result = await sql`
      SELECT id, event_type, payload, resource_id, processed, created_at
      FROM bling_webhook_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return result as WebhookLog[]
  } catch (error) {
    console.error("Error fetching webhook logs:", error)
    throw error
  }
}

export default sql
