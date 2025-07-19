import { NextResponse } from "next/server"
import { getBlingTokens } from "@/lib/db"

export async function GET() {
  try {
    const tokens = await getBlingTokens()

    if (!tokens) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        message: "Nenhum token encontrado",
        timestamp: new Date().toISOString(),
      })
    }

    const now = new Date()
    const isExpired = tokens.expiresAt <= now

    return NextResponse.json({
      success: true,
      authenticated: !isExpired,
      hasTokens: true,
      expiresAt: tokens.expiresAt.toISOString(),
      isExpired,
      message: isExpired ? "Token expirado" : "Token válido",
      timestamp: now.toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao verificar status de autenticação:", error)

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
