import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

    if (!clientId) {
      return NextResponse.json({ error: "BLING_CLIENT_ID não configurado" }, { status: 500 })
    }

    // Gerar state para segurança CSRF
    const state = randomBytes(32).toString("hex")

    // Escopos conforme documentação Bling
    const scopes = [
      "produtos.read",
      "produtos.write",
      "estoque.read",
      "estoque.write",
      "pedidos.read",
      "pedidos.write",
      "nfe.read",
      "nfe.write",
      "webhooks.read",
      "webhooks.write",
    ].join(" ")

    const redirectUri = `${baseUrl}/api/bling/oauth/callback`

    // URL de autorização OAuth 2.0
    const authUrl = new URL("https://www.bling.com.br/Api/v3/oauth/authorize")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", scopes)
    authUrl.searchParams.set("state", state)

    // Salvar state no cookie para validação
    const response = NextResponse.redirect(authUrl.toString())
    response.cookies.set("bling_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutos
    })

    return response
  } catch (error) {
    console.error("Erro na autorização OAuth:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
