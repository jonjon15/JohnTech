import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorização não fornecido" }, { status: 400 })
    }

    // Trocar código por token
    const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.BLING_CLIENT_ID!,
        client_secret: process.env.BLING_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error("Erro ao obter token:", tokenResponse.status, errorData)
      return NextResponse.json({ error: "Falha ao obter token", details: errorData }, { status: tokenResponse.status })
    }

    const tokenData = await tokenResponse.json()
    console.log("Token obtido com sucesso:", { ...tokenData, access_token: "***", refresh_token: "***" })

    // Salvar tokens no banco
    const userEmail = "admin@johntech.com"
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    await sql`
      INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at, created_at, updated_at)
      VALUES (${userEmail}, ${tokenData.access_token}, ${tokenData.refresh_token}, ${expiresAt}, NOW(), NOW())
      ON CONFLICT (user_email) 
      DO UPDATE SET 
        access_token = ${tokenData.access_token},
        refresh_token = ${tokenData.refresh_token},
        expires_at = ${expiresAt},
        updated_at = NOW()
    `

    return NextResponse.json({
      success: true,
      message: "Token obtido e salvo com sucesso",
      expires_at: expiresAt,
    })
  } catch (error: any) {
    console.error("Erro interno ao processar token:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}
