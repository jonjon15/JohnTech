import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/bling/oauth/callback`

    if (!clientId) {
      return NextResponse.json({ error: "BLING_CLIENT_ID não configurado" }, { status: 500 })
    }

    // Gerar state para segurança
    const state = crypto.randomUUID()

    // Escopos necessários para homologação
    const scopes = [
      "produtos.read",
      "produtos.write",
      "pedidos.read",
      "pedidos.write",
      "estoque.read",
      "estoque.write",
    ].join(" ")

    const authUrl = new URL("https://bling.com.br/Api/v3/oauth/authorize")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", scopes)
    authUrl.searchParams.set("state", state)

    // Salvar state na sessão (simplificado - em produção usar sessão segura)
    const response = NextResponse.redirect(authUrl.toString())
    response.cookies.set("bling_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10 minutos
    })

    return response
  } catch (error) {
    console.error("Erro ao iniciar autorização OAuth:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
