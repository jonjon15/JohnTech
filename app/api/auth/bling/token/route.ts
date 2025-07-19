import { NextResponse } from "next/server"
import { saveTokens } from "@/lib/bling-auth"

export async function POST(request: Request) {
  try {
    console.log("=== PROCESSANDO CALLBACK OAUTH ===")

    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorização não fornecido" }, { status: 400 })
    }

    console.log("Código recebido:", code.substring(0, 10) + "...")
    console.log("State:", state)

    // Trocar código por token
    const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      }),
    })

    const responseText = await tokenResponse.text()
    console.log("Resposta do token:", {
      status: tokenResponse.status,
      body: responseText.substring(0, 200) + "...",
    })

    if (!tokenResponse.ok) {
      console.error("Erro ao obter token:", tokenResponse.status, responseText)
      return NextResponse.json(
        { error: "Falha ao obter token", details: responseText },
        { status: tokenResponse.status },
      )
    }

    const tokenData = JSON.parse(responseText)
    const userEmail = "admin@johntech.com"

    // Salvar tokens no banco
    const saved = await saveTokens(userEmail, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)

    if (!saved) {
      return NextResponse.json({ error: "Falha ao salvar tokens" }, { status: 500 })
    }

    console.log("=== TOKENS SALVOS COM SUCESSO ===")

    return NextResponse.json({
      success: true,
      message: "Autenticação realizada com sucesso",
      expires_in: tokenData.expires_in,
      user_email: userEmail,
    })
  } catch (error: any) {
    console.error("=== ERRO NO CALLBACK OAUTH ===")
    console.error("Erro:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}
