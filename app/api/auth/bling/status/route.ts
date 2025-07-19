import { NextResponse } from "next/server"
import { getBlingTokens } from "@/lib/db"

const userEmail = "admin@johntech.com"

export async function GET() {
  try {
    console.log("🔍 Verificando status da autenticação Bling...")

    const token = await getBlingTokens(userEmail)

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        message: "Nenhuma autenticação encontrada",
      })
    }

    const expiresAt = new Date(token.expires_at)
    const now = new Date()
    const isExpired = now >= expiresAt

    return NextResponse.json({
      authenticated: !isExpired,
      user_email: token.user_email,
      expires_at: token.expires_at,
      created_at: token.created_at,
      is_expired: isExpired,
      expires_in_minutes: Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60)),
    })
  } catch (error: any) {
    console.error("❌ Erro ao verificar status:", error)

    return NextResponse.json(
      {
        authenticated: false,
        error: error.message || "Erro interno ao verificar status",
      },
      { status: 500 },
    )
  }
}
