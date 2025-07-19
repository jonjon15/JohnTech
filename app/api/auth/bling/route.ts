import { NextResponse } from "next/server"
import { getBlingAuthUrl } from "@/lib/bling-auth"

/**
 * Rota para iniciar o processo de autenticação OAuth do Bling.
 * Redireciona o usuário para a URL de autorização do Bling.
 */
export async function GET() {
  try {
    const authUrl = getBlingAuthUrl()
    console.log("🔗 Redirecionando para URL de autorização do Bling:", authUrl)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("❌ Erro ao gerar URL de autorização do Bling:", error)
    return NextResponse.json(
      { error: "Failed to generate Bling authorization URL", details: (error as Error).message },
      { status: 500 },
    )
  }
}
