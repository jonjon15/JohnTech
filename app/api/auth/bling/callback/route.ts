import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, saveTokens, getBlingAuthRedirectUri } from "@/lib/bling-auth"

/**
 * Rota de callback para o Bling OAuth.
 * Recebe o código de autorização e troca por tokens de acesso e refresh.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state") // Opcional, para segurança CSRF

  if (!code) {
    console.error("❌ Bling Callback: Código de autorização não encontrado.")
    return NextResponse.redirect(new URL("/auth?error=no_code", request.url))
  }

  // Em um cenário real, você validaria o 'state' aqui para prevenir CSRF
  // if (state !== storedState) { ... }

  try {
    const redirectUri = getBlingAuthRedirectUri() // Obtenha a URI de redirecionamento configurada
    const tokenData = await exchangeCodeForTokens(code, redirectUri)

    if (!tokenData) {
      console.error("❌ Bling Callback: Falha ao trocar código por tokens.")
      return NextResponse.redirect(new URL("/auth?error=token_exchange_failed", request.url))
    }

    // Assumindo um usuário fixo para este exemplo. Em uma aplicação real,
    // você associaria os tokens ao usuário logado.
    const userEmail = process.env.BLING_USER_EMAIL || "default_user@example.com"
    const saved = await saveTokens(userEmail, tokenData)

    if (!saved) {
      console.error("❌ Bling Callback: Falha ao salvar tokens.")
      return NextResponse.redirect(new URL("/auth?error=token_save_failed", request.url))
    }

    console.log("✅ Bling Callback: Autenticação e tokens salvos com sucesso.")
    return NextResponse.redirect(new URL("/configuracao-bling?success=true", request.url))
  } catch (error) {
    console.error("❌ Bling Callback: Erro inesperado durante o processo:", error)
    return NextResponse.redirect(new URL("/auth?error=internal_error", request.url))
  }
}
