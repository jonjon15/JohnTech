import { sql } from "@vercel/postgres"

interface BlingToken {
  access_token: string
  refresh_token: string
  expires_at: string
}

const REFRESH_TIMEOUT = 5000 // 5 segundos para refresh

export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  try {
    console.log("🔑 Buscando token para:", userEmail)

    // Buscar token no banco com timeout rápido
    const result = await sql<BlingToken>`
      SELECT access_token, refresh_token, expires_at 
      FROM bling_tokens 
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.rows.length === 0) {
      console.log("❌ Nenhum token encontrado")
      return null
    }

    const tokenData = result.rows[0]
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    const isExpired = now >= expiresAt
    const minutesUntilExpiry = Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60)

    console.log("📊 Status do token:", {
      expires_at: expiresAt.toISOString(),
      is_expired: isExpired,
      minutes_until_expiry: minutesUntilExpiry,
      force_refresh: forceRefresh,
    })

    // Se não está expirado e não é refresh forçado
    if (!isExpired && !forceRefresh) {
      console.log("✅ Usando token existente válido")
      return tokenData.access_token
    }

    // Token expirado ou refresh forçado
    console.log("🔄 Renovando token...")
    return await refreshAccessToken(userEmail, tokenData.refresh_token)
  } catch (error) {
    console.error("❌ Erro ao obter token:", error)
    return null
  }
}

async function refreshAccessToken(userEmail: string, refreshToken: string): Promise<string | null> {
  try {
    if (!refreshToken) {
      console.error("❌ Refresh token não disponível")
      return null
    }

    console.log("🔄 Fazendo refresh do token...")

    const credentials = Buffer.from(`${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`).toString(
      "base64",
    )

    // Timeout para refresh
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT)

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
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseText = await refreshResponse.text()
    console.log("📡 Resposta do refresh:", {
      status: refreshResponse.status,
      body_length: responseText.length,
    })

    if (!refreshResponse.ok) {
      console.error("❌ Falha no refresh:", refreshResponse.status)

      // Se refresh token inválido, limpar do banco
      if (refreshResponse.status === 400) {
        console.log("🗑️ Removendo tokens inválidos")
        await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`
      }

      return null
    }

    const newTokenData = JSON.parse(responseText)
    const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000)

    console.log("✅ Token renovado:", {
      expires_in: newTokenData.expires_in,
      new_expires_at: newExpiresAt.toISOString(),
    })

    // Salvar novo token
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
  } catch (error: any) {
    console.error("❌ Erro no refresh:", error.message)

    if (error.name === "AbortError") {
      console.error("⏰ Timeout no refresh do token")
    }

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

    console.log("💾 Salvando tokens:", {
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

    console.log("✅ Tokens salvos com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro ao salvar tokens:", error)
    return false
  }
}

export async function clearTokens(userEmail: string): Promise<void> {
  try {
    await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`
    console.log("🗑️ Tokens removidos para:", userEmail)
  } catch (error) {
    console.error("❌ Erro ao remover tokens:", error)
  }
}
