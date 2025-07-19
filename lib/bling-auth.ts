import { getPool } from "./db"
import type { BlingAuthTokens, BlingAuthError } from "@/types/bling"

/**
 * Gerenciador de autenticação OAuth 2.0 do Bling
 * Baseado em: https://developer.bling.com.br/aplicativos#fluxo-de-autorização
 */
export class BlingAuth {
  private static readonly CLIENT_ID = process.env.BLING_CLIENT_ID!
  private static readonly CLIENT_SECRET = process.env.BLING_CLIENT_SECRET!
  private static readonly REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
  private static readonly API_BASE_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

  /**
   * Gera URL de autorização OAuth 2.0
   * https://developer.bling.com.br/aplicativos#obtenção-do-authorization-code
   */
  static getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: "read write",
      state: state || crypto.randomUUID(),
    })

    return `https://www.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`
  }

  /**
   * Troca authorization code por access token
   * https://developer.bling.com.br/aplicativos#tokens-de-acesso
   */
  static async exchangeCodeForTokens(code: string): Promise<BlingAuthTokens> {
    try {
      console.log("🔄 Trocando authorization code por tokens...")

      const response = await fetch(`${this.API_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
          code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const error = data as BlingAuthError
        console.error("❌ Erro ao obter tokens:", error)
        throw new Error(`Erro de autenticação: ${error.error_description || error.error}`)
      }

      const tokens: BlingAuthTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type || "Bearer",
        expires_in: data.expires_in,
        expires_at: new Date(Date.now() + data.expires_in * 1000),
        scope: data.scope,
      }

      // Salva tokens no banco
      await this.saveTokens(tokens)

      console.log("✅ Tokens obtidos e salvos com sucesso")
      return tokens
    } catch (error) {
      console.error("❌ Erro ao trocar code por tokens:", error)
      throw error
    }
  }

  /**
   * Renova access token usando refresh token
   * https://developer.bling.com.br/aplicativos#refresh-token
   */
  static async refreshAccessToken(): Promise<BlingAuthTokens> {
    try {
      const currentTokens = await this.getStoredTokens()
      if (!currentTokens?.refresh_token) {
        throw new Error("Refresh token não encontrado")
      }

      console.log("🔄 Renovando access token...")

      const response = await fetch(`${this.API_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          refresh_token: currentTokens.refresh_token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const error = data as BlingAuthError
        console.error("❌ Erro ao renovar token:", error)
        throw new Error(`Erro ao renovar token: ${error.error_description || error.error}`)
      }

      const tokens: BlingAuthTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || currentTokens.refresh_token,
        token_type: data.token_type || "Bearer",
        expires_in: data.expires_in,
        expires_at: new Date(Date.now() + data.expires_in * 1000),
        scope: data.scope,
      }

      // Atualiza tokens no banco
      await this.saveTokens(tokens)

      console.log("✅ Access token renovado com sucesso")
      return tokens
    } catch (error) {
      console.error("❌ Erro ao renovar access token:", error)
      throw error
    }
  }

  /**
   * Obtém access token válido (renova se necessário)
   */
  static async getValidAccessToken(): Promise<string> {
    try {
      const tokens = await this.getStoredTokens()
      if (!tokens) {
        throw new Error("Tokens não encontrados. Faça a autenticação primeiro.")
      }

      // Verifica se o token ainda é válido (com margem de 5 minutos)
      const now = new Date()
      const expiresAt = tokens.expires_at ? new Date(tokens.expires_at) : new Date(0)
      const marginMs = 5 * 60 * 1000 // 5 minutos

      if (expiresAt.getTime() - now.getTime() > marginMs) {
        return tokens.access_token
      }

      // Token expirado, tenta renovar
      console.log("⏰ Access token expirado, renovando...")
      const newTokens = await this.refreshAccessToken()
      return newTokens.access_token
    } catch (error) {
      console.error("❌ Erro ao obter access token válido:", error)
      throw error
    }
  }

  /**
   * Salva tokens no banco de dados
   */
  private static async saveTokens(tokens: BlingAuthTokens): Promise<void> {
    const pool = getPool()
    try {
      await pool.query(
        `INSERT INTO bling_auth_tokens 
         (access_token, refresh_token, token_type, expires_in, expires_at, scope)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_type = EXCLUDED.token_type,
         expires_in = EXCLUDED.expires_in,
         expires_at = EXCLUDED.expires_at,
         scope = EXCLUDED.scope,
         updated_at = NOW()`,
        [
          tokens.access_token,
          tokens.refresh_token,
          tokens.token_type,
          tokens.expires_in,
          tokens.expires_at,
          tokens.scope,
        ],
      )
    } catch (error) {
      console.error("❌ Erro ao salvar tokens:", error)
      throw error
    }
  }

  /**
   * Obtém tokens armazenados no banco
   */
  private static async getStoredTokens(): Promise<BlingAuthTokens | null> {
    const pool = getPool()
    try {
      const result = await pool.query(
        `SELECT access_token, refresh_token, token_type, expires_in, expires_at, scope
         FROM bling_auth_tokens 
         ORDER BY created_at DESC 
         LIMIT 1`,
      )

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        access_token: row.access_token,
        refresh_token: row.refresh_token,
        token_type: row.token_type,
        expires_in: row.expires_in,
        expires_at: row.expires_at ? new Date(row.expires_at) : undefined,
        scope: row.scope,
      }
    } catch (error) {
      console.error("❌ Erro ao obter tokens armazenados:", error)
      return null
    }
  }

  /**
   * Revoga access token
   * https://developer.bling.com.br/aplicativos#revogando-o-access-token
   */
  static async revokeAccessToken(): Promise<void> {
    try {
      const tokens = await this.getStoredTokens()
      if (!tokens) {
        console.log("ℹ️ Nenhum token para revogar")
        return
      }

      console.log("🔄 Revogando access token...")

      const response = await fetch(`${this.API_BASE_URL}/oauth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          token: tokens.access_token,
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("❌ Erro ao revogar token:", error)
        throw new Error(`Erro ao revogar token: ${error.error_description || error.error}`)
      }

      // Remove tokens do banco
      const pool = getPool()
      await pool.query("DELETE FROM bling_auth_tokens")

      console.log("✅ Access token revogado com sucesso")
    } catch (error) {
      console.error("❌ Erro ao revogar access token:", error)
      throw error
    }
  }

  /**
   * Verifica se está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens()
      return tokens !== null && tokens.access_token !== ""
    } catch (error) {
      console.error("❌ Erro ao verificar autenticação:", error)
      return false
    }
  }

  /**
   * Obtém informações do usuário autenticado
   * https://developer.bling.com.br/aplicativos#obter-recurso-do-usuário
   */
  static async getUserInfo(): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken()

      const response = await fetch(`${this.API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao obter informações do usuário: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("❌ Erro ao obter informações do usuário:", error)
      throw error
    }
  }

  /**
   * Obtém status da autenticação
   */
  static async getAuthStatus(): Promise<{
    authenticated: boolean
    expiresAt?: Date
    userInfo?: any
  }> {
    try {
      const tokens = await this.getStoredTokens()
      if (!tokens) {
        return { authenticated: false }
      }

      const userInfo = await this.getUserInfo()
      return {
        authenticated: true,
        expiresAt: tokens.expires_at,
        userInfo,
      }
    } catch (error) {
      console.error("❌ Erro ao obter status da autenticação:", error)
      return { authenticated: false }
    }
  }
}
