import { type NextRequest, NextResponse } from "next/server"
import { saveTokens } from "@/lib/bling-auth"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorização não fornecido" }, { status: 400 })
    }

    console.log("Iniciando troca de código por token...")

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
      const errorText = await tokenResponse.text()
      console.error("Erro ao obter token:", tokenResponse.status, errorText)
      return NextResponse.json({ error: "Falha ao obter token", details: errorText }, { status: tokenResponse.status })
    }

    const tokenData = await tokenResponse.json()
    console.log("Token obtido com sucesso. Expires in:", tokenData.expires_in)

    // Salvar tokens no banco
    const userEmail = "admin@johntech.com"
    const success = await saveTokens(userEmail, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)

    if (!success) {
      return NextResponse.json({ error: "Falha ao salvar tokens" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Token obtido e salvo com sucesso",
      expires_in: tokenData.expires_in,
    })
  } catch (error: any) {
    console.error("Erro interno ao processar token:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}
