import { type NextRequest, NextResponse } from "next/server"
import { generateAuthUrl } from "@/lib/bling-auth"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    console.log("🔐 Iniciando processo de autorização OAuth...")

    // Gerar state para segurança
    const state = randomUUID()

    // Construir redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/auth/bling/callback`

    console.log("🔗 Redirect URI:", redirectUri)

    // Gerar URL de autorização
    const authUrl = generateAuthUrl(redirectUri, state)

    console.log("🚀 Redirecionando para:", authUrl)

    // Redirecionar para o Bling
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error("❌ Erro ao gerar URL de autorização:", error)

    const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
    errorUrl.searchParams.set("error", "auth_url_error")
    errorUrl.searchParams.set("message", error.message || "Erro ao gerar URL de autorização")

    return NextResponse.redirect(errorUrl)
  }
}
