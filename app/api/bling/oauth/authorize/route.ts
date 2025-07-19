import { NextResponse } from "next/server"
import { generateAuthUrl } from "@/lib/bling-auth"
import { createTablesIfNotExists } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔄 Iniciando autorização OAuth Bling...")

    // Garantir que as tabelas existem
    await createTablesIfNotExists()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const redirectUri = `${baseUrl}/api/bling/oauth/callback`
    const state = crypto.randomUUID()

    console.log("📍 Redirect URI:", redirectUri)

    const authUrl = generateAuthUrl(redirectUri, state)
    console.log("🔗 Auth URL gerada:", authUrl)

    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error("❌ Erro na autorização:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao iniciar autorização OAuth",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
