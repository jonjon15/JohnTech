import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Verificar se houve erro na autorização
    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=${encodeURIComponent(error)}`)
    }

    // Verificar state para segurança
    const savedState = request.cookies.get("bling_oauth_state")?.value
    if (!state || state !== savedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=invalid_state`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=no_code`)
    }

    // Trocar código por tokens
    const tokenResponse = await fetch("https://bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.BLING_CLIENT_ID!,
        client_secret: process.env.BLING_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/bling/oauth/callback`,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Erro ao obter tokens:", errorData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=token_error`)
    }

    const tokens = await tokenResponse.json()

    // Obter informações do usuário
    const userResponse = await fetch("https://bling.com.br/Api/v3/usuario", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    })

    let userEmail = "usuario@bling.com"
    if (userResponse.ok) {
      const userData = await userResponse.json()
      userEmail = userData.data?.email || userEmail
    }

    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Salvar tokens no banco
    await sql`
      INSERT INTO bling_auth_tokens (
        user_email, 
        access_token, 
        refresh_token, 
        token_type, 
        expires_at, 
        scope
      ) VALUES (
        ${userEmail},
        ${tokens.access_token},
        ${tokens.refresh_token},
        ${tokens.token_type || "Bearer"},
        ${expiresAt.toISOString()},
        ${tokens.scope || ""}
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
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?auth=success`)
    response.cookies.delete("bling_oauth_state")

    return response
  } catch (error) {
    console.error("Erro no callback OAuth:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth?error=callback_error`)
  }
}
