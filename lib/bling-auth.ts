import { getPool } from "./db" // Importa getPool para obter o pool de conexões
import type { BlingTokenData } from "@/types/bling"

const BLING_API_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
const BLING_CLIENT_ID = process.env.BLING_CLIENT_ID
const BLING_CLIENT_SECRET = process.env.BLING_CLIENT_SECRET
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

if (!BLING_CLIENT_ID || !BLING_CLIENT_SECRET || !NEXT_PUBLIC_BASE_URL) {
  console.error(
    "Variáveis de ambiente BLING_CLIENT_ID, BLING_CLIENT_SECRET ou NEXT_PUBLIC_BASE_URL não estão definidas.",
  )
  // Em um ambiente de produção, você pode querer lançar um erro ou sair do processo.
  // Para desenvolvimento, pode ser útil ter um fallback ou um aviso.
}

/**
 * Constrói a URL de autorização do Bling para o fluxo OAuth 2.0.
 * @returns A URL completa para redirecionar o usuário.
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
  authUrl.searchParams.set("state", "random_string_for_csrf_protection") // Em produção, gere e valide um state único
  authUrl.searchParams.set("scope", "produtos,pedidos,estoques,contatos") // Exemplo de escopos
  return authUrl.toString()
}

/**
 * Retorna a URI de redirecionamento configurada para o Bling OAuth.
 * @returns A URI de redirecionamento.
 */
export function getBlingAuthRedirectUri(): string {
  if (!NEXT_PUBLIC_BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL não definida para redirect URI do Bling.")
  }
  return `${NEXT_PUBLIC_BASE_URL}/api/auth/bling/callback`
}

/**
 * Troca o código de autorização por tokens de acesso e refresh do Bling.
 * @param code O código de autorização recebido do Bling.
 * @param redirectUri A URI de redirecionamento usada na etapa de autorização.
 * @returns Os dados do token (access_token, refresh_token, expires_in, token_type).
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<BlingTokenData | null> {
  if (!BLING_CLIENT_ID || !BLING_CLIENT_SECRET) {
    throw new Error("BLING_CLIENT_ID ou BLING_CLIENT_SECRET não definidos para troca de tokens Bling.")
  }

  const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString("base64")

  try {
    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ Erro ao trocar código por tokens:", response.status, errorData)
      return null
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(), // Calcula a data de expiração
    }
  } catch (error) {
    console.error("❌ Erro na requisição de troca de tokens:", error)
    return null
  }
}

/**
 * Refreshes o token de acesso do Bling usando o refresh token.
 * @param userEmail O email do usuário associado aos tokens.
 * @param currentRefreshToken O refresh token atual.
 * @returns Os novos dados do token ou null se o refresh falhar.
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
    const response = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: currentRefreshToken,
      }).toString(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ Erro ao refrescar token:", response.status, errorData)
      // Se o refresh token for inválido, limpe os tokens e force reautenticação
      if (response.status === 400 || response.status === 401) {
        console.warn(`Refresh token inválido para ${userEmail}. Limpando tokens.`)
        await clearTokens(userEmail)
      }
      return null
    }

    const data = await response.json()
    const newTokenData: BlingTokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || currentRefreshToken, // Bling pode retornar um novo refresh_token ou o mesmo
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
    await saveTokens(userEmail, newTokenData) // Salva os novos tokens
    return newTokenData
  } catch (error) {
    console.error("❌ Erro na requisição de refresh de tokens:", error)
    return null
  }
}

/**
 * Salva ou atualiza os tokens do Bling para um usuário específico no banco de dados.
 * @param userEmail O email do usuário.
 * @param tokenData Os dados do token a serem salvos.
 * @returns true se salvo com sucesso, false caso contrário.
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
    return result.rowCount > 0
  } catch (error) {
    console.error("❌ Erro ao salvar tokens no banco de dados:", error)
    return false
  }
}

/**
 * Obtém os tokens do Bling para um usuário específico.
 * @param userEmail O email do usuário.
 * @returns Os dados do token ou null se não encontrados.
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
        expiresIn: 0, // Não armazenado, mas pode ser calculado
        tokenType: "Bearer", // Assumido
        scope: "", // Não armazenado
      }
    }
    return null
  } catch (error) {
    console.error("❌ Erro ao obter tokens do banco de dados:", error)
    return null
  }
}

/**
 * Obtém um token de acesso Bling válido para um usuário.
 * Tenta refrescar se o token existente estiver expirado ou próximo de expirar.
 * @param userEmail O email do usuário.
 * @param forceRefresh Opcional. Se true, força o refresh do token.
 * @returns O token de acesso válido ou null se não for possível obter um.
 */
export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  const tokens = await getTokens(userEmail)

  if (!tokens) {
    console.log(`Token Bling não encontrado para ${userEmail}.`)
    return null
  }

  const now = new Date()
  const expiresAt = new Date(tokens.expiresAt)
  const isExpired = now >= expiresAt
  const isAboutToExpire = expiresAt.getTime() - now.getTime() < 60 * 1000 // Menos de 1 minuto para expirar

  if (isExpired || isAboutToExpire || forceRefresh) {
    console.log(`Token Bling para ${userEmail} expirado, próximo de expirar ou refresh forçado. Tentando refrescar...`)
    const newTokens = await refreshAccessToken(userEmail, tokens.refreshToken)
    if (newTokens) {
      console.log(`✅ Token Bling refrescado com sucesso para ${userEmail}.`)
      return newTokens.accessToken
    } else {
      console.error(`❌ Falha ao refrescar token Bling para ${userEmail}.`)
      return null
    }
  }

  return tokens.accessToken
}

/**
 * Limpa os tokens do Bling para um usuário específico no banco de dados.
 * @param userEmail O email do usuário.
 * @returns true se os tokens foram limpos com sucesso, false caso contrário.
 */
export async function clearTokens(userEmail: string): Promise<boolean> {
  const pool = getPool()
  try {
    const result = await pool.query(`DELETE FROM bling_tokens WHERE user_email = $1`, [userEmail])
    return result.rowCount > 0
  } catch (error) {
    console.error("❌ Erro ao limpar tokens do banco de dados:", error)
    return false
  }
}
