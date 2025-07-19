import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, saveTokens } from "@/lib/bling-auth"
import { createTablesIfNotExists } from "@/lib/db"

const USER_EMAIL = "admin@johntech.com"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Processando callback OAuth...")

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    console.log("📦 Parâmetros recebidos:", { code: !!code, error, state })

    if (error) {
      console.error("❌ Erro OAuth:", error)
      return NextResponse.redirect(`${request.nextUrl.origin}/auth?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      console.error("❌ Código não fornecido")
      return NextResponse.redirect(`${request.nextUrl.origin}/auth?error=no_code`)
    }

    // Garantir que as tabelas existem
    await createTablesIfNotExists()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/bling/oauth/callback`

    console.log("🔄 Trocando código por tokens...")
    const tokenData = await exchangeCodeForTokens(code, redirectUri)

    if (!tokenData) {
      console.error("❌ Falha ao obter tokens")
      return NextResponse.redirect(`${request.nextUrl.origin}/auth?error=token_exchange_failed`)
    }

    console.log("💾 Salvando tokens...")
    const saved = await saveTokens(USER_EMAIL, tokenData)

    if (!saved) {
      console.error("❌ Falha ao salvar tokens")
      return NextResponse.redirect(`${request.nextUrl.origin}/auth?error=token_save_failed`)
    }

    console.log("✅ OAuth concluído com sucesso")
    return NextResponse.redirect(`${request.nextUrl.origin}/dashboard?success=oauth_complete`)
  } catch (error) {
    console.error("❌ Erro no callback:", error)
    return NextResponse.redirect(`${request.nextUrl.origin}/auth?error=callback_error`)
  }
}
