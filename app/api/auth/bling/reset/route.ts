import { NextResponse } from "next/server"
import { clearTokens } from "@/lib/bling-auth"

const userEmail = "admin@johntech.com"

export async function POST() {
  try {
    console.log("🗑️ Resetando autenticação Bling...")

    const success = await clearTokens(userEmail)

    if (success) {
      console.log("✅ Tokens removidos com sucesso")
      return NextResponse.json({
        success: true,
        message: "Autenticação removida com sucesso",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao remover tokens",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Erro ao resetar autenticação:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno ao resetar autenticação",
      },
      { status: 500 },
    )
  }
}
