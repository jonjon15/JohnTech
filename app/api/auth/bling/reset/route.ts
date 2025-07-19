import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("=== INICIANDO RESET DA AUTENTICAÇÃO ===")

    const userEmail = "admin@johntech.com"

    // Remover todos os tokens do usuário
    const deleteResult = await sql`
      DELETE FROM bling_tokens 
      WHERE user_email = ${userEmail}
    `

    console.log(`Tokens removidos: ${deleteResult.rowCount}`)

    // Verificar se ainda existem tokens
    const remainingTokens = await sql`
      SELECT COUNT(*) as count FROM bling_tokens 
      WHERE user_email = ${userEmail}
    `

    const tokensRemaining = Number.parseInt(remainingTokens.rows[0].count)

    console.log(`Tokens restantes: ${tokensRemaining}`)

    return NextResponse.json({
      success: true,
      message: `Autenticação resetada com sucesso. ${deleteResult.rowCount} token(s) removido(s).`,
      user_email: userEmail,
      tokens_removed: deleteResult.rowCount,
      tokens_remaining: tokensRemaining,
      next_step: "Faça nova autenticação em /configuracao-bling",
      auth_url: "/configuracao-bling",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("=== ERRO NO RESET DA AUTENTICAÇÃO ===")
    console.error("Erro:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao resetar autenticação",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST para resetar a autenticação",
    endpoint: "/api/auth/bling/reset",
    method: "POST",
  })
}
