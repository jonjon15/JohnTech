import { type NextRequest, NextResponse } from "next/server"
import { saveTokens } from "@/lib/bling-auth"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      console.error("Código de autorização não fornecido")
      return NextResponse.json({ error: "Código de autorização é obrigatório" }, { status: 400 })
    }

    console.log("=== INICIANDO TROCA DE CÓDIGO POR TOKEN ===")
    console.log("Code recebido:", code.substring(0, 10) + "...")
    console.log("State:", state)

    // Verificar variáveis de ambiente
    if (!process.env.BLING_CLIENT_ID || !process.env.BLING_CLIENT_SECRET) {
      console.error("Variáveis de ambiente do Bling não configuradas")
      return NextResponse.json({ error: "Configuração do Bling incompleta" }, { status: 500 })
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
    console.log("Redirect URI:", redirectUri)

    // Usar Basic Auth conforme documentação do Bling
    const credentials = Buffer.from(`${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`).toString(
      "base64",
    )

    const formData = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    })

    console.log("Form data:", formData.toString())
    console.log("Authorization header:", `Basic ${credentials.substring(0, 20)}...`)

    const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
        "User-Agent": "BlingPro/1.0",
      },
      body: formData,
    })

    const responseText = await tokenResponse.text()

    console.log("=== RESPOSTA DO BLING ===")
    console.log("Status:", tokenResponse.status)
    console.log("Headers:", Object.fromEntries(tokenResponse.headers.entries()))
    console.log("Body:", responseText)

    if (!tokenResponse.ok) {
      console.error("Erro ao obter token do Bling:", tokenResponse.status, responseText)

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }

      return NextResponse.json(
        {
          error: "Falha na autenticação com Bling",
          details: errorData,
          status: tokenResponse.status,
        },
        { status: tokenResponse.status },
      )
    }

    const tokenData = JSON.parse(responseText)
    console.log("=== TOKEN OBTIDO COM SUCESSO ===")
    console.log("Expires in:", tokenData.expires_in, "segundos")
    console.log("Token type:", tokenData.token_type)

    // Salvar tokens no banco
    const userEmail = "admin@johntech.com"
    const success = await saveTokens(userEmail, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)

    if (!success) {
      console.error("Falha ao salvar tokens no banco")
      return NextResponse.json({ error: "Falha ao salvar tokens no banco de dados" }, { status: 500 })
    }

    console.log("=== PROCESSO CONCLUÍDO COM SUCESSO ===")

    return NextResponse.json({
      success: true,
      message: "Token obtido e salvo com sucesso",
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    })
  } catch (error: any) {
    console.error("=== ERRO CRÍTICO ===")
    console.error("Erro interno ao processar token:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
