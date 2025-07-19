import { getPool } from "./db"
import type { BlingTokenData } from "@/types/bling"

/**
 * Obtém tokens do Bling para um usuário específico
 * Esta é uma função de compatibilidade que delega para bling-auth.ts
 */
export async function getTokens(userEmail: string): Promise<BlingTokenData | null> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT access_token, refresh_token, expires_at, created_at, updated_at
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
        expiresIn: Math.max(0, Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000)),
        tokenType: "Bearer",
        scope: "",
      }
    }

    return null
  } catch (error) {
    console.error("❌ Erro ao obter tokens:", error)
    return null
  }
}

/**
 * Verifica se um token está válido (não expirado)
 */
export async function isTokenValid(userEmail: string): Promise<boolean> {
  const tokens = await getTokens(userEmail)

  if (!tokens) {
    return false
  }

  const now = new Date()
  const expiresAt = new Date(tokens.expiresAt)

  return now < expiresAt
}

/**
 * Obtém informações sobre todos os tokens armazenados
 */
export async function getAllTokensInfo(): Promise<
  Array<{
    userEmail: string
    hasToken: boolean
    isValid: boolean
    expiresAt: string | null
    createdAt: string
    updatedAt: string
  }>
> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT user_email, expires_at, created_at, updated_at
       FROM bling_tokens
       ORDER BY updated_at DESC`,
    )

    const now = new Date()

    return result.rows.map((row) => ({
      userEmail: row.user_email,
      hasToken: true,
      isValid: new Date(row.expires_at) > now,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }))
  } catch (error) {
    console.error("❌ Erro ao obter informações dos tokens:", error)
    return []
  }
}

/**
 * Remove tokens expirados do banco de dados
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `DELETE FROM bling_tokens 
       WHERE expires_at < NOW() - INTERVAL '7 days'`,
    )

    const deletedCount = result.rowCount || 0
    if (deletedCount > 0) {
      console.log(`🧹 Removidos ${deletedCount} tokens expirados`)
    }

    return deletedCount
  } catch (error) {
    console.error("❌ Erro ao limpar tokens expirados:", error)
    return 0
  }
}
