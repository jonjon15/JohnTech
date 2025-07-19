import { sql } from "@vercel/postgres"

interface BlingToken {
  access_token: string
  refresh_token: string
  expires_at: string
}

export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    // Buscar token atual do banco
    const result = await sql<BlingToken>`
      SELECT access_token, refresh_token, expires_at 
      FROM bling_tokens 
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (result.rows.length === 0) {
      console.log("Nenhum token encontrado para o usuário:", userEmail)
      return null
    }

    const tokenData = result.rows[0]
    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()
    const isExpired = now >= expiresAt

    // Se não está expirado e não é refresh forçado, retorna o token atual
    if (!isExpired && !forceRefresh) {
      return tokenData.access_token
    }

    // Token expirado ou refresh forçado - tentar renovar
    console.log("Token expirado ou refresh forçado. Renovando...")

    const refreshResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token,
        client_id: process.env.BLING_CLIENT_ID!,
        client_secret: process.env.BLING_CLIENT_SECRET!,
      }),
    })

    if (!refreshResponse.ok) {
      console.error("Falha ao renovar token:", refreshResponse.status)
      return null
    }

    const newTokenData = await refreshResponse.json()
    const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000)

    // Atualizar token no banco
    await sql`
      UPDATE bling_tokens 
      SET access_token = ${newTokenData.access_token},
          refresh_token = ${newTokenData.refresh_token},
          expires_at = ${newExpiresAt},
          updated_at = NOW()
      WHERE user_email = ${userEmail}
    `

    console.log("Token renovado com sucesso")
    return newTokenData.access_token
  } catch (error) {
    console.error("Erro ao obter token válido:", error)
    return null
  }
}

export async function clearTokens(userEmail: string): Promise<void> {
  try {
    await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`
    console.log("Tokens removidos para:", userEmail)
  } catch (error) {
    console.error("Erro ao remover tokens:", error)
  }
}
