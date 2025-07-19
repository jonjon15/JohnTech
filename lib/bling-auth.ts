import { getPool } from "./db"
import type { BlingTokenData } from "@/types/bling"

const BLING_API_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
const BLING_CLIENT_ID = process.env.BLING_CLIENT_ID
const BLING_CLIENT_SECRET = process.env.BLING_CLIENT_SECRET
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

if (!BLING_CLIENT_ID || !BLING_CLIENT_SECRET || !NEXT_PUBLIC_BASE_URL) {
  console.error(
    "❌ Variáveis de ambiente BLING_CLIENT_ID, BLING_CLIENT_SECRET ou NEXT_PUBLIC_BASE_URL não estão definidas.",
  )
}

/**
 * Constrói a URL de autorização do Bling para o fluxo OAuth 2.0
 */
export function getBlingAuthUrl(): string {
  if (!BLING_CLIENT_ID || !NEXT_PUBLIC_BASE_URL) {
    throw new Error("BLING_CLIENT_ID ou NEXT_PUBLIC_BASE_URL não definidos para autenticação Bling.")
  }

  const redirectUri = `${NEXT_PUBLIC_BASE_URL}/api/auth/bling/callback`
  const authUrl = new URL(`${BLING_API_URL}/oauth/authorize`)

  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", BLING_CLIENT_ID)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", crypto.randomUUID()) // Estado único para CSRF protection
  authUrl.searchParams.set("scope", "produtos,pedidos,estoques,contatos,vendas,compras,financeiro")

  return authUrl.toString()
}

/**
 * Retorna a URI de redirecionamento configurada para o Bling OAuth
 */
export function getBlingAuthRedirectUri(): string {
  if (!NEXT_PUBLIC_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL não definida para redirect URI do Bling.")
  }
  return `${NEXT_PUBLIC_BASE_URL}/api/auth/bling/callback`
}

/**
 * Troca o código de autorização por tokens de acesso e refresh do Bling
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<BlingTokenData | null> {
  if (!BLING_CLIENT_ID || !BLING_CLIENT_SECRET) {
    throw new Error("BLING_CLIENT_ID ou BLING_CLIENT_SECRET não definidos para troca de tokens Bling.")
  }

  const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString("base64")

  try {
    console.log("🔄 Iniciando troca de código por tokens...")

    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    const responseText = await response.text()
    console.log("📋 Response status:", response.status)
    console.log("📋 Response body:", responseText)

    if (!response.ok) {
      console.error("❌ Erro ao trocar código por tokens:", response.status, responseText)
      return null
    }

    const data = JSON.parse(responseText)

    const tokenData: BlingTokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || "Bearer",
      scope: data.scope || "",
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }

    console.log("✅ Tokens obtidos com sucesso")
    return tokenData
  } catch (error) {
    console.error("❌ Erro na requisição de troca de tokens:", error)
    return null
  }
}

/**
 * Refreshes o token de acesso do Bling usando o refresh token
 */
export async function refreshAccessToken(
  userEmail: string,
  currentRefreshToken: string,
): Promise<BlingTokenData | null> {
  if (!BLING_CLIENT_ID || !BLING_CLIENT_SECRET) {
    throw new Error("BLING_CLIENT_ID ou BLING_CLIENT_SECRET não definidos para refresh de tokens Bling.")
  }

  const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString("base64")

  try {
    console.log(`🔄 Refreshing token para ${userEmail}...`)

    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: currentRefreshToken,
      }).toString(),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Erro ao refrescar token:", response.status, errorData)

      // Se o refresh token for inválido, limpe os tokens
      if (response.status === 400 || response.status === 401) {
        console.warn(`🧹 Refresh token inválido para ${userEmail}. Limpando tokens.`)
        await clearTokens(userEmail)
      }
      return null
    }

    const data = await response.json()
    const newTokenData: BlingTokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || currentRefreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type || "Bearer",
      scope: data.scope || "",
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }

    await saveTokens(userEmail, newTokenData)
    console.log(`✅ Token refreshed com sucesso para ${userEmail}`)
    return newTokenData
  } catch (error) {
    console.error("❌ Erro na requisição de refresh de tokens:", error)
    return null
  }
}

/**
 * Salva ou atualiza os tokens do Bling para um usuário específico no banco de dados
 */
export async function saveTokens(userEmail: string, tokenData: BlingTokenData): Promise<boolean> {
  const pool = getPool()
  try {
    const result = await pool.query(
      `INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_email) DO UPDATE
       SET access_token = EXCLUDED.access_token,
           refresh_token = EXCLUDED.refresh_token,
           expires_at = EXCLUDED.expires_at,
           updated_at = NOW()
       RETURNING *`,
      [userEmail, tokenData.accessToken, tokenData.refreshToken, tokenData.expiresAt],
    )

    console.log(`💾 Tokens salvos para ${userEmail}`)
    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("❌ Erro ao salvar tokens no banco de dados:", error)
    return false
  }
}

/**
 * Obtém os tokens do Bling para um usuário específico
 */
export async function getTokens(userEmail: string): Promise<BlingTokenData | null> {
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
    console.error("❌ Erro ao obter tokens do banco de dados:", error)
    return null
  }
}

/**
 * Obtém um token de acesso Bling válido para um usuário
 * Tenta refrescar se o token existente estiver expirado ou próximo de expirar
 */
export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  const tokens = await getTokens(userEmail)

  if (!tokens) {
    console.log(`🔍 Token Bling não encontrado para ${userEmail}`)
    return null
  }

  const now = new Date()
  const expiresAt = new Date(tokens.expiresAt)
  const isExpired = now >= expiresAt
  const isAboutToExpire = expiresAt.getTime() - now.getTime() < 300000 // 5 minutos

  if (isExpired || isAboutToExpire || forceRefresh) {
    console.log(
      `🔄 Token para ${userEmail} precisa ser refreshed (expired: ${isExpired}, aboutToExpire: ${isAboutToExpire}, forced: ${forceRefresh})`,
    )

    const newTokens = await refreshAccessToken(userEmail, tokens.refreshToken)
    if (newTokens) {
      return newTokens.accessToken
    } else {
      console.error(`❌ Falha ao refrescar token para ${userEmail}`)
      return null
    }
  }

  return tokens.accessToken
}

/**
 * Limpa os tokens do Bling para um usuário específico no banco de dados
 */
export async function clearTokens(userEmail: string): Promise<boolean> {
  const pool = getPool()
  try {
    const result = await pool.query(`DELETE FROM bling_tokens WHERE user_email = $1`, [userEmail])
    console.log(`🧹 Tokens limpos para ${userEmail}`)
    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("❌ Erro ao limpar tokens do banco de dados:", error)
    return false
  }
}
