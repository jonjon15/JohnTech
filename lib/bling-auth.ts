import { sql } from "@vercel/postgres"

export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    // Buscar token no banco
    const result = await sql`
      SELECT access_token, refresh_token, expires_at 
      FROM bling_tokens 
      WHERE user_email = ${userEmail}
    `

    if (result.rows.length === 0) {
      console.log("Nenhum token encontrado para o usuário:", userEmail)
      return null
    }

    const tokenData = result.rows[0]
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    // Se o token ainda é válido e não foi forçado o refresh
    if (!forceRefresh && expiresAt > now) {
      return tokenData.access_token
    }

    // Token expirado ou refresh forçado - tentar renovar
    console.log("Token expirado ou refresh forçado. Renovando...")

    if (!tokenData.refresh_token) {
      console.error("Refresh token não encontrado")
      return null
    }

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

    // Salvar novo token no banco
    await sql`
      UPDATE bling_tokens 
      SET 
        access_token = ${newTokenData.access_token},
        refresh_token = ${newTokenData.refresh_token || tokenData.refresh_token},
        expires_at = ${newExpiresAt.toISOString()},
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

export async function saveTokens(userEmail: string, accessToken: string, refreshToken: string, expiresIn: number) {
  try {
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

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

    console.log("Tokens salvos com sucesso para:", userEmail)
    return true
  } catch (error) {
    console.error("Erro ao salvar tokens:", error)
    return false
  }
}
