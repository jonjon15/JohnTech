import { sql } from "@vercel/postgres"

interface BlingToken {
  access_token: string
  refresh_token: string
  expires_at: string
}

export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    // Buscar token no banco
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
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    const isExpired = now >= expiresAt

    console.log("Token status:", {
      expires_at: expiresAt.toISOString(),
      current_time: now.toISOString(),
      is_expired: isExpired,
      force_refresh: forceRefresh,
    })

    // Se não está expirado e não é refresh forçado, retorna o token atual
    if (!isExpired && !forceRefresh) {
      console.log("Usando token existente válido")
      return tokenData.access_token
    }

    // Token expirado ou refresh forçado - tentar renovar
    console.log("Tentando renovar token...")
    return await refreshAccessToken(userEmail, tokenData.refresh_token)
  } catch (error) {
    console.error("Erro ao obter token válido:", error)
    return null
  }
}

async function refreshAccessToken(userEmail: string, refreshToken: string): Promise<string | null> {
  try {
    if (!refreshToken) {
      console.error("Refresh token não disponível")
      return null
    }

    console.log("Fazendo chamada de refresh token...")

    // Usar Basic Auth conforme documentação do Bling
    const credentials = Buffer.from(`${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`).toString(
      "base64",
    )

    const refreshResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
        "User-Agent": "BlingPro/1.0",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    const responseText = await refreshResponse.text()
    console.log("Resposta do refresh:", {
      status: refreshResponse.status,
      headers: Object.fromEntries(refreshResponse.headers.entries()),
      body: responseText,
    })

    if (!refreshResponse.ok) {
      console.error("Falha ao renovar token:", refreshResponse.status, responseText)

      // Se o refresh token é inválido, limpar tokens do banco
      if (refreshResponse.status === 400) {
        console.log("Refresh token inválido, removendo tokens do banco")
        await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`
      }

      return null
    }

    const newTokenData = JSON.parse(responseText)
    const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000)

    console.log("Token renovado com sucesso:", {
      expires_in: newTokenData.expires_in,
      new_expires_at: newExpiresAt.toISOString(),
    })

    // Salvar novo token no banco
    await sql`
      UPDATE bling_tokens 
      SET 
        access_token = ${newTokenData.access_token},
        refresh_token = ${newTokenData.refresh_token || refreshToken},
        expires_at = ${newExpiresAt.toISOString()},
        updated_at = NOW()
      WHERE user_email = ${userEmail}
    `

    return newTokenData.access_token
  } catch (error) {
    console.error("Erro ao renovar token:", error)
    return null
  }
}

export async function saveTokens(
  userEmail: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    console.log("Salvando tokens:", {
      user_email: userEmail,
      expires_in: expiresIn,
      expires_at: expiresAt.toISOString(),
    })

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

    console.log("Tokens salvos com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao salvar tokens:", error)
    return false
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
