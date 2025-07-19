import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("=== INICIANDO RESET DA AUTENTICAÇÃO ===")

    const userEmail = "admin@johntech.com"

    // Contar tokens antes da remoção
    const countBefore = await sql`SELECT COUNT(*) as count FROM bling_tokens WHERE user_email = ${userEmail}`

    console.log("Tokens antes da remoção:", countBefore.rows[0].count)

    // Remover todos os tokens do usuário
    const deleteResult = await sql`DELETE FROM bling_tokens WHERE user_email = ${userEmail}`

    console.log("Resultado da remoção:", deleteResult)

    // Contar tokens após a remoção
    const countAfter = await sql`SELECT COUNT(*) as count FROM bling_tokens WHERE user_email = ${userEmail}`

    console.log("Tokens após a remoção:", countAfter.rows[0].count)

    const tokensRemoved = Number.parseInt(countBefore.rows[0].count) - Number.parseInt(countAfter.rows[0].count)

    console.log("=== RESET CONCLUÍDO COM SUCESSO ===")
    console.log("Tokens removidos:", tokensRemoved)

    return NextResponse.json({
      success: true,
      message: "Autenticação resetada com sucesso",
      user_email: userEmail,
      tokens_removed: tokensRemoved,
      timestamp: new Date().toISOString(),
      next_step: "Faça nova autenticação em /configuracao-bling",
    })
  } catch (error: any) {
    console.error("=== ERRO NO RESET ===")
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
