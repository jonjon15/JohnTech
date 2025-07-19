import { sql } from "@vercel/postgres"

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
  resource_id?: string
  payload: any
  status: string
  processed_at?: string
  created_at: string
}

export async function createTablesIfNotExists() {
  try {
    console.log("🔧 Verificando e criando tabelas...")

    // Criar tabela bling_tokens
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

    // Criar índices para bling_tokens
    await sql`CREATE INDEX IF NOT EXISTS idx_bling_tokens_user_email ON bling_tokens(user_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_bling_tokens_expires_at ON bling_tokens(expires_at)`

    // Criar tabela webhook_logs
    await sql`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(100),
        payload JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'received',
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Criar índices para webhook_logs
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at)`

    console.log("✅ Tabelas criadas/verificadas com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro ao criar tabelas:", error)
    return false
  }
}

export async function getBlingToken(userEmail: string): Promise<BlingToken | null> {
  try {
    const result = await sql<BlingToken>`
      SELECT * FROM bling_tokens 
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("❌ Erro ao buscar token:", error)
    return null
  }
}

export async function saveBlingToken(
  userEmail: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
): Promise<boolean> {
  try {
    await sql`
      INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at, created_at, updated_at)
      VALUES (${userEmail}, ${accessToken}, ${refreshToken}, ${expiresAt.toISOString()}, NOW(), NOW())
      ON CONFLICT (user_email) 
      DO UPDATE SET 
        access_token = ${accessToken},
        refresh_token = ${refreshToken},
        expires_at = ${expiresAt.toISOString()},
        updated_at = NOW()
    `
    return true
  } catch (error) {
    console.error("❌ Erro ao salvar token:", error)
    return false
  }
}

export async function deleteBlingToken(userEmail: string): Promise<boolean> {
  try {
    await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`
    return true
  } catch (error) {
    console.error("❌ Erro ao deletar token:", error)
    return false
  }
}

export async function saveWebhookLog(
  eventType: string,
  resourceId: string | null,
  payload: any,
  status = "received",
): Promise<boolean> {
  try {
    await sql`
      INSERT INTO webhook_logs (event_type, resource_id, payload, status, created_at)
      VALUES (${eventType}, ${resourceId}, ${JSON.stringify(payload)}, ${status}, NOW())
    `
    return true
  } catch (error) {
    console.error("❌ Erro ao salvar webhook log:", error)
    return false
  }
}
