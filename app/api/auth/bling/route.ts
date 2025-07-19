import { NextResponse } from "next/server"
import { getBlingAuthUrl } from "@/lib/bling-auth"

/**
 * Rota para iniciar o processo de autenticação OAuth do Bling.
 * Redireciona o usuário para a URL de autorização do Bling.
 */
export async function GET() {
  try {
    const authUrl = getBlingAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Erro ao gerar URL de autenticação do Bling:", error)
    return NextResponse.json({ success: false, message: "Erro ao iniciar autenticação do Bling." }, { status: 500 })
  }
}
