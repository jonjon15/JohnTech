import { type NextRequest, NextResponse } from "next/server"
import { getRelatorioEstoque } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/estoque/relatorio", {})

    const relatorio = await getRelatorioEstoque()

    // Calcular estatísticas
    const stats = {
      total_produtos: relatorio.length,
      produtos_ok: relatorio.filter((r) => r.status === "OK").length,
      produtos_baixo: relatorio.filter((r) => r.status === "BAIXO").length,
      produtos_zerado: relatorio.filter((r) => r.status === "ZERADO").length,
      produtos_negativo: relatorio.filter((r) => r.status === "NEGATIVO").length,
      valor_total_estoque: relatorio.reduce((sum, r) => sum + r.valor_total, 0),
    }

    return NextResponse.json({
      success: true,
      data: relatorio,
      stats,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao gerar relatório:`, error)
    return handleBlingError(error, requestId)
  }
}
