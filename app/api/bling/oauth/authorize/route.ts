import { type NextRequest, NextResponse } from "next/server"
import { generateAuthUrl } from "@/lib/bling-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Iniciando autorização OAuth...")

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/bling/oauth/callback`
    const state = crypto.randomUUID()

    console.log("📍 Redirect URI:", redirectUri)

    const authUrl = generateAuthUrl(redirectUri, state)

    console.log("🔗 URL de autorização gerada")

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("❌ Erro na autorização:", error)
    return NextResponse.json({ error: "Erro ao gerar URL de autorização" }, { status: 500 })
  }
}
