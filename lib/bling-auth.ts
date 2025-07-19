import { sql } from "@vercel/postgres"

export interface BlingTokenData {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope?: string
}

export interface StoredToken {
  id: number
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: string
  created_at: string
  updated_at: string
}

const BLING_API_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
const CLIENT_ID = process.env.BLING_CLIENT_ID!
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET!

export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    console.log(`🔑 Obtendo token para ${userEmail} (force: ${forceRefresh})`)

    // Buscar token atual
    const result = await sql<StoredToken>`
      SELECT * FROM bling_tokens 
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.rows.length === 0) {
      console.log("❌ Nenhum token encontrado no banco")
      return null
    }

    const token = result.rows[0]
    const expiresAt = new Date(token.expires_at)
    const now = new Date()
    const isExpired = now >= expiresAt

    console.log(`📅 Token expira em: ${expiresAt.toISOString()}`)
    console.log(`⏰ Agora: ${now.toISOString()}`)
    console.log(`🔍 Expirado: ${isExpired}`)

    // Se não expirou e não é refresh forçado, retornar token atual
    if (!isExpired && !forceRefresh) {
      console.log("✅ Token válido encontrado")
      return token.access_token
    }

    // Tentar refresh
    console.log("🔄 Tentando refresh do token...")
    const refreshed = await refreshAccessToken(userEmail, token.refresh_token)

    if (refreshed) {
      console.log("✅ Token refreshed com sucesso")
      return refreshed
    }

    console.log("❌ Falha no refresh, token inválido")
    return null
  } catch (error) {
    console.error("❌ Erro ao obter token:", error)
    return null
  }
}

export async function refreshAccessToken(userEmail: string, refreshToken: string): Promise<string | null> {
  try {
    console.log("🔄 Iniciando refresh do token...")

    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro no refresh:", response.status, errorText)
      return null
    }

    const data: BlingTokenData = await response.json()
    console.log("📦 Dados do refresh:", { expires_in: data.expires_in, token_type: data.token_type })

    // Calcular nova data de expiração
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in)

    // Salvar novo token
    await sql`
      UPDATE bling_tokens 
      SET 
        access_token = ${data.access_token},
        refresh_token = ${data.refresh_token},
        expires_at = ${expiresAt.toISOString()},
        updated_at = NOW()
      WHERE user_email = ${userEmail}
    `

    console.log("✅ Token atualizado no banco")
    return data.access_token
  } catch (error) {
    console.error("❌ Erro no refresh:", error)
    return null
  }
}

export async function saveTokens(userEmail: string, tokenData: BlingTokenData): Promise<boolean> {
  try {
    console.log("💾 Salvando tokens para:", userEmail)

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in)

    await sql`
      INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at, created_at, updated_at)
      VALUES (${userEmail}, ${tokenData.access_token}, ${tokenData.refresh_token}, ${expiresAt.toISOString()}, NOW(), NOW())
      ON CONFLICT (user_email) 
      DO UPDATE SET 
        access_token = ${tokenData.access_token},
        refresh_token = ${tokenData.refresh_token},
        expires_at = ${expiresAt.toISOString()},
        updated_at = NOW()
    `

    console.log("✅ Tokens salvos com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro ao salvar tokens:", error)
    return false
  }
}

export async function clearTokens(userEmail: string): Promise<boolean> {
  try {
    console.log("🗑️ Removendo tokens para:", userEmail)

    const result = await sql`
      DELETE FROM bling_tokens 
      WHERE user_email = ${userEmail}
    `

    console.log("✅ Tokens removidos:", result.rowCount)
    return true
  } catch (error) {
    console.error("❌ Erro ao remover tokens:", error)
    return false
  }
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<BlingTokenData | null> {
  try {
    console.log("🔄 Trocando código por tokens...")

    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erro na troca:", response.status, errorText)
      return null
    }

    const data: BlingTokenData = await response.json()
    console.log("✅ Tokens obtidos com sucesso")
    return data
  } catch (error) {
    console.error("❌ Erro na troca de código:", error)
    return null
  }
}

export function generateAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read write",
  })

  if (state) {
    params.append("state", state)
  }

  return `${BLING_API_URL}/oauth/authorize?${params.toString()}`
}
