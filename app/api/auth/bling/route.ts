import { NextResponse } from "next/server"
import { BlingAuth } from "@/lib/bling-auth"

/**
 * Endpoint para iniciar autenticação OAuth 2.0 com Bling
 */
export async function GET() {
  try {
    const state = crypto.randomUUID()
    const authUrl = BlingAuth.getAuthorizationUrl(state)

    return NextResponse.json({
      success: true,
      authUrl,
      state,
    })
  } catch (error) {
    console.error("❌ Erro ao gerar URL de autenticação:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao gerar URL de autenticação",
      },
      { status: 500 },
    )
  }
}
