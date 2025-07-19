import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, saveTokens } from "@/lib/bling-auth"

const USER_EMAIL = process.env.BLING_USER_EMAIL || "default_user@example.com"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "Código de autorização não encontrado" }, { status: 400 })
  }

  // Opcional: validar o 'state' aqui se você o estiver usando

  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/bling/oauth/callback`
  const tokenData = await exchangeCodeForTokens(code, redirectUri)

  if (!tokenData) {
    return NextResponse.json({ error: "Falha ao obter tokens de acesso" }, { status: 500 })
  }

  const saved = await saveTokens(USER_EMAIL, tokenData)

  if (!saved) {
    return NextResponse.json({ error: "Falha ao salvar tokens no banco de dados" }, { status: 500 })
  }

  // Redirecionar para a página de homologação ou dashboard
  return NextResponse.redirect(new URL("/homologacao", request.url))
}
