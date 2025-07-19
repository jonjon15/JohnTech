import { sql } from "@vercel/postgres"

interface BlingToken {
  access_token: string
  refresh_token: string
  expires_at: Date
}

export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    // Buscar token atual
    const result = await sql`
      SELECT access_token, refresh_token, expires_at 
      FROM bling_tokens 
      WHERE user_email = ${userEmail}
    `

    if (result.rows.length === 0) {
      console.log("Nenhum token encontrado para o usuário:", userEmail)
      return null
    }

    const token = result.rows[0] as BlingToken
    const now = new Date()
    const expiresAt = new Date(token.expires_at)

    // Se o token ainda é válido e não é refresh forçado
    if (!forceRefresh && expiresAt > now) {
      return token.access_token
    }

    // Token expirado ou refresh forçado - tentar renovar
    console.log("Token expirado ou refresh forçado. Renovando...")
    return await refreshAccessToken(userEmail, token.refresh_token)
  } catch (error) {
    console.error("Erro ao obter token válido:", error)
    return null
  }
}

async function refreshAccessToken(userEmail: string, refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.BLING_CLIENT_ID!,
        client_secret: process.env.BLING_CLIENT_SECRET!,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro ao renovar token:", response.status, errorText)
      return null
    }

    const tokenData = await response.json()
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // Atualizar token no banco
    await sql`
      UPDATE bling_tokens 
      SET access_token = ${tokenData.access_token},
          refresh_token = ${tokenData.refresh_token || refreshToken},
          expires_at = ${expiresAt},
          updated_at = NOW()
      WHERE user_email = ${userEmail}
    `

    console.log("Token renovado com sucesso")
    return tokenData.access_token
  } catch (error) {
    console.error("Erro ao renovar token:", error)
    return null
  }
}

export async function revokeToken(userEmail: string): Promise<boolean> {
  try {
    await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`
    return true
  } catch (error) {
    console.error("Erro ao revogar token:", error)
    return false
  }
}
