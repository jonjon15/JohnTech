import { sql } from "@/lib/db"

const BLING_CLIENT_ID = process.env.BLING_CLIENT_ID!
const BLING_CLIENT_SECRET = process.env.BLING_CLIENT_SECRET!
const BLING_TOKEN_URL = "https://www.bling.com.br/Api/v3/oauth/token"

/**
 * Dados de autenticação recuperados do banco.
 */
interface TokenRow {
  bling_access_token: string | null
  bling_refresh_token: string | null
  bling_token_expires_at: Date | null
}

/**
 * Devolve sempre um access token válido para o e-mail informado.
 * Faz refresh se:
 *  • não existir access token,
 *  • estiver expirado,
 *  • ou se for solicitado explicitamente (ex.: resposta 401).
 */
export async function getValidAccessToken(userEmail: string, forceRefresh = false): Promise<string | null> {
  // 1. Lê tokens do banco
  const [row] = await sql<TokenRow[]>`
    SELECT bling_access_token, bling_refresh_token, bling_token_expires_at
    FROM users
    WHERE email = ${userEmail}
    LIMIT 1
  `

  if (!row) {
    console.error("getValidAccessToken: usuário não encontrado:", userEmail)
    return null
  }

  const { bling_access_token, bling_refresh_token, bling_token_expires_at } = row
  const isExpired =
    !bling_access_token || !bling_token_expires_at || new Date(bling_token_expires_at).getTime() < Date.now() + 60_000 // 1 min de folga

  if ((isExpired || forceRefresh) && bling_refresh_token) {
    console.log("getValidAccessToken: fazendo refresh do token…")

    try {
      const form = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: bling_refresh_token,
      })

      const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString("base64")

      const res = await fetch(BLING_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: form,
      })

      if (!res.ok) {
        console.error("Falha ao renovar token:", res.status, await res.text())
        return null
      }

      const data: {
        access_token: string
        refresh_token: string
        expires_in: number
      } = await res.json()

      const newExpires = new Date(Date.now() + data.expires_in * 1000)

      // Salva no banco
      await sql`
        UPDATE users
        SET
          bling_access_token = ${data.access_token},
          bling_refresh_token = ${data.refresh_token},
          bling_token_expires_at = ${newExpires.toISOString()}
        WHERE email = ${userEmail}
      `

      console.log("Token renovado com sucesso — novo vencimento:", newExpires.toISOString())
      return data.access_token
    } catch (err) {
      console.error("Erro inesperado durante refresh:", err)
      return null
    }
  }

  return bling_access_token
}
