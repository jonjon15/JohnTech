import pool from "./db"
import type { BlingTokenData, StoredToken } from "@/types/bling"

const BLING_API_URL = "https://www.bling.com.br/Api/v3"
const CLIENT_ID = process.env.BLING_CLIENT_ID!
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET!

/**
 * Salva ou atualiza os tokens de autenticação no banco de dados.
 */
export async function saveTokens(userEmail: string, tokenData: BlingTokenData): Promise<boolean> {
  try {
    console.log(`💾 Salvando tokens para: ${userEmail}`)
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    await pool.query(
      `
      INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (user_email)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `,
      [userEmail, tokenData.access_token, tokenData.refresh_token, expiresAt.toISOString()],
    )

    console.log("✅ Tokens salvos com sucesso.")
    return true
  } catch (error) {
    console.error("❌ Erro ao salvar tokens:", error)
    return false
  }
}

/**
 * Troca um código de autorização por tokens de acesso e refresh.
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<BlingTokenData | null> {
  try {
    console.log("🔄 Trocando código de autorização por tokens...")
    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro na troca de código:", response.status, errorText)
      return null
    }

    const data: BlingTokenData = await response.json()
    console.log("✅ Tokens obtidos com sucesso via código.")
    return data
  } catch (error) {
    console.error("❌ Erro crítico na troca de código:", error)
    return null
  }
}

/**
 * Atualiza um access token expirado usando o refresh token.
 */
async function refreshAccessToken(userEmail: string, refreshToken: string): Promise<string | null> {
  try {
    console.log(`🔄 Atualizando token para ${userEmail}...`)
    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro no refresh do token:", response.status, errorText)
      if (response.status === 400 || response.status === 401) {
        await clearTokens(userEmail)
        console.log(`🗑️ Tokens inválidos para ${userEmail} foram limpos.`)
      }
      return null
    }

    const data: BlingTokenData = await response.json()
    await saveTokens(userEmail, data)
    console.log("✅ Token atualizado e salvo com sucesso.")
    return data.access_token
  } catch (error) {
    console.error("❌ Erro crítico no refresh do token:", error)
    return null
  }
}

/**
 * Obtém um access token válido, atualizando-o se necessário.
 */
export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    const result = await pool.query<StoredToken>(
      `SELECT * FROM bling_tokens WHERE user_email = $1 ORDER BY created_at DESC LIMIT 1`,
      [userEmail],
    )

    if (result.rows.length === 0) {
      console.log(`🤷 Nenhum token encontrado para ${userEmail}.`)
      return null
    }

    const token = result.rows[0]
    const expiresAt = new Date(token.expires_at)
    const now = new Date()
    const isExpired = now.getTime() > expiresAt.getTime() - 60000 // 1 min de margem

    if (!isExpired && !forceRefresh) {
      console.log(`✅ Token válido para ${userEmail} encontrado no cache.`)
      return token.access_token
    }

    console.log(`⌛ Token para ${userEmail} expirado ou refresh forçado.`)
    return await refreshAccessToken(userEmail, token.refresh_token)
  } catch (error) {
    console.error(`❌ Erro ao obter token válido para ${userEmail}:`, error)
    return null
  }
}

/**
 * Limpa os tokens de um usuário do banco de dados.
 */
export async function clearTokens(userEmail: string): Promise<boolean> {
  try {
    console.log(`🗑️ Removendo tokens para: ${userEmail}`)
    await pool.query(`DELETE FROM bling_tokens WHERE user_email = $1`, [userEmail])
    return true
  } catch (error) {
    console.error(`❌ Erro ao remover tokens para ${userEmail}:`, error)
    return false
  }
}
