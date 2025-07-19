import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Código de autorização é obrigatório" }, { status: 400 })
    }

    const tokenUrl = "https://www.bling.com.br/Api/v3/oauth/token"

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      client_id: process.env.BLING_CLIENT_ID!,
      client_secret: process.env.BLING_CLIENT_SECRET!,
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Erro na resposta do Bling:", data)
      return NextResponse.json({ error: data.error_description || "Erro ao obter token" }, { status: response.status })
    }

    // Aqui você salvaria o token no banco de dados
    // Por enquanto, apenas retornamos sucesso

    return NextResponse.json({
      success: true,
      message: "Token obtido com sucesso",
      access_token: data.access_token,
      expires_in: data.expires_in,
    })
  } catch (error) {
    console.error("Erro no endpoint de token:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
