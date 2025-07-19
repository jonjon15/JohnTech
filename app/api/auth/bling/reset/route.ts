import { NextResponse } from "next/server"
import { clearTokens } from "@/lib/bling-auth"

export async function POST() {
  try {
    console.log("=== RESETANDO AUTENTICAÇÃO ===")

    const userEmail = "admin@johntech.com"
    await clearTokens(userEmail)

    console.log("Tokens removidos com sucesso")

    return NextResponse.json({
      success: true,
      message: "Tokens removidos com sucesso",
      next_step: "Faça nova autenticação em /configuracao-bling",
      auth_url: `/configuracao-bling`,
    })
  } catch (error: any) {
    console.error("Erro ao resetar autenticação:", error)

    return NextResponse.json(
      {
        error: "Erro ao resetar autenticação",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
