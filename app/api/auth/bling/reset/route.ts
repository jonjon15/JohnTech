import { NextResponse } from "next/server"
import { clearTokens } from "@/lib/bling-auth"
import { createTablesIfNotExists } from "@/lib/db"

const userEmail = "admin@johntech.com"

export async function POST() {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] Reset Auth - INÍCIO`)

    // Garantir que as tabelas existem
    await createTablesIfNotExists()

    // Limpar tokens
    console.log(`🗑️ [${requestId}] Removendo tokens para: ${userEmail}`)
    const cleared = await clearTokens(userEmail)

    const elapsedTime = Date.now() - startTime

    if (cleared) {
      console.log(`✅ [${requestId}] Reset concluído em ${elapsedTime}ms`)

      return NextResponse.json({
        success: true,
        message: "Autenticação resetada com sucesso",
        user_email: userEmail,
        tokens_removed: 1,
        elapsed_time: elapsedTime,
        timestamp: new Date().toISOString(),
        next_step: "Faça nova autenticação OAuth em /configuracao-bling",
        request_id: requestId,
      })
    } else {
      throw new Error("Falha ao remover tokens do banco de dados")
    }
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no reset:`, error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Erro interno no reset",
        user_email: userEmail,
        elapsed_time: elapsedTime,
        timestamp: new Date().toISOString(),
        request_id: requestId,
        error_details: {
          type: error.constructor.name,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
