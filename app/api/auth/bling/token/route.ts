import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorização não fornecido" }, { status: 400 })
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      console.error("Variáveis de ambiente do Bling não configuradas")
      return NextResponse.json({ error: "Configuração do Bling incompleta" }, { status: 500 })
    }

    // Codificar credenciais em Base64 conforme RFC 6749
    const credentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64")

    // Trocar código por token
    const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI || "",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Erro ao obter token do Bling:", tokenResponse.status, errorText)
      return NextResponse.json(
        { error: "Falha na autenticação com Bling", details: errorText },
        { status: tokenResponse.status },
      )
    }

    const tokenData = await tokenResponse.json()
    console.log("Token obtido com sucesso:", { expires_in: tokenData.expires_in })

    // Salvar token no banco
    const userEmail = "admin@example.com" // Em produção, pegar do usuário logado
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

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
      message: "Token salvo com sucesso",
      expires_at: expiresAt,
    })
  } catch (error: any) {
    console.error("Erro interno ao processar token:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}
