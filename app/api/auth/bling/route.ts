import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.CLIENT_ID
    const redirectUri = process.env.REDIRECT_URI

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        {
          error: "CLIENT_ID ou REDIRECT_URI não configurado",
        },
        { status: 500 },
      )
    }

    // Gerar state para segurança (CSRF protection)
    const state = randomBytes(32).toString("hex")

    // URL de autorização conforme documentação oficial do Bling
    const authUrl = new URL("https://www.bling.com.br/OAuth2/views/login.php")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("state", state)

    console.log("OAuth URL:", authUrl.toString())
    console.log("Redirect URI:", redirectUri)

    // Salvar state na sessão/cookie para validação posterior
    const response = NextResponse.redirect(authUrl.toString())
    response.cookies.set("bling_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutos
    })

    return response
  } catch (error) {
    console.error("Erro na autenticação Bling:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
