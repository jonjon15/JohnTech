import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

const BLING_API_URL = "https://www.bling.com.br/Api/v3"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Verificar se houve erro na autorização
    if (error) {
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", error)
      return NextResponse.redirect(errorUrl)
    }

    // Verificar código
    if (!code) {
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", "missing_code")
      return NextResponse.redirect(errorUrl)
    }

    // Verificar state (CSRF protection)
    const savedState = request.cookies.get("bling_oauth_state")?.value
    if (!savedState || savedState !== state) {
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", "invalid_state")
      return NextResponse.redirect(errorUrl)
    }

    // Trocar código por tokens
    const tokenResponse = await fetch(`${BLING_API_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${request.nextUrl.origin}/api/bling/oauth/callback`,
        client_id: process.env.BLING_CLIENT_ID!,
        client_secret: process.env.BLING_CLIENT_SECRET!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Erro ao obter tokens:", errorText)
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", "token_exchange_failed")
      return NextResponse.redirect(errorUrl)
    }

    const tokenData = await tokenResponse.json()

    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in)

    // Salvar tokens no banco
    await sql`
      INSERT INTO bling_auth_tokens (
        user_email, 
        access_token, 
        refresh_token, 
        token_type,
        expires_at,
        scope,
        created_at,
        updated_at
      ) VALUES (
        'admin@johntech.com',
        ${tokenData.access_token},
        ${tokenData.refresh_token},
        ${tokenData.token_type || "Bearer"},
        ${expiresAt.toISOString()},
        ${tokenData.scope || ""},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_email) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_type = EXCLUDED.token_type,
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        updated_at = NOW()
    `

    // Limpar cookie de state
    const successUrl = new URL("/configuracao-bling", request.nextUrl.origin)
    successUrl.searchParams.set("success", "true")

    const response = NextResponse.redirect(successUrl)
    response.cookies.delete("bling_oauth_state")

    return response
  } catch (error) {
    console.error("Erro no callback OAuth:", error)
    const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
    errorUrl.searchParams.set("error", "internal_error")
    return NextResponse.redirect(errorUrl)
  }
}
