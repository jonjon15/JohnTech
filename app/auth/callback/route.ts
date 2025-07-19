import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Verificar se houve erro na autorização
    if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: "Acesso negado pelo usuário",
        invalid_request: "Requisição inválida",
        unauthorized_client: "Cliente não autorizado",
        unsupported_response_type: "Tipo de resposta não suportado",
        invalid_scope: "Escopo inválido",
        server_error: "Erro interno do servidor Bling",
        temporarily_unavailable: "Serviço temporariamente indisponível",
      }

      const message = errorMessages[error] || errorDescription || "Erro desconhecido"
      return NextResponse.redirect(`/auth?error=${encodeURIComponent(message)}`)
    }

    // Validar parâmetros obrigatórios
    if (!code || !state) {
      return NextResponse.redirect("/auth?error=missing_parameters")
    }

    // Validar state (proteção CSRF)
    const savedState = request.cookies.get("bling_oauth_state")?.value
    if (!savedState || savedState !== state) {
      return NextResponse.redirect("/auth?error=invalid_state")
    }

    // Trocar authorization code por access token
    const tokenResponse = await exchangeCodeForToken(code, request.nextUrl.origin)

    if (!tokenResponse.success) {
      return NextResponse.redirect(`/auth?error=${encodeURIComponent(tokenResponse.error)}`)
    }

    // Salvar tokens no banco de dados
    await saveTokensToDatabase(tokenResponse.data)

    // Limpar state cookie
    const response = NextResponse.redirect("/dashboard?success=connected")
    response.cookies.delete("bling_oauth_state")

    return response
  } catch (error) {
    console.error("Erro no callback OAuth:", error)
    return NextResponse.redirect("/auth?error=callback_failed")
  }
}

async function exchangeCodeForToken(code: string, origin: string) {
  try {
    const clientId = process.env.BLING_CLIENT_ID!
    const clientSecret = process.env.BLING_CLIENT_SECRET!
    const redirectUri = `${origin}/auth/callback`

    const tokenUrl = "https://www.bling.com.br/Api/v3/oauth/token"
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Erro ao trocar código por token:", response.status, errorData)

      const errorMessages: Record<string, string> = {
        invalid_request: "Requisição inválida",
        invalid_client: "Cliente inválido",
        invalid_grant: "Código de autorização inválido ou expirado",
        unauthorized_client: "Cliente não autorizado",
        unsupported_grant_type: "Tipo de grant não suportado",
        invalid_scope: "Escopo inválido",
      }

      const errorCode = errorData.error || "token_exchange_failed"
      return {
        success: false,
        error: errorMessages[errorCode] || "Falha ao obter token de acesso",
      }
    }

    const tokenData = await response.json()
    return { success: true, data: tokenData }
  } catch (error) {
    console.error("Erro inesperado na troca de token:", error)
    return { success: false, error: "Erro interno na autenticação" }
  }
}

async function saveTokensToDatabase(tokenData: any) {
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

  // Por enquanto, vamos usar um usuário padrão
  // Em produção, você deve associar ao usuário logado
  const userEmail = "admin@johntech.com"

  await sql`
    INSERT INTO users (email, bling_access_token, bling_refresh_token, bling_token_expires_at)
    VALUES (${userEmail}, ${tokenData.access_token}, ${tokenData.refresh_token}, ${expiresAt.toISOString()})
    ON CONFLICT (email) 
    DO UPDATE SET
      bling_access_token = ${tokenData.access_token},
      bling_refresh_token = ${tokenData.refresh_token},
      bling_token_expires_at = ${expiresAt.toISOString()},
      updated_at = NOW()
  `
}
