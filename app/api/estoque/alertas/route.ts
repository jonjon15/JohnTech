import { type NextRequest, NextResponse } from "next/server"
import { getAlertasEstoque } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/estoque/alertas", {})

    const alertas = await getAlertasEstoque()

    return NextResponse.json({
      success: true,
      data: alertas,
      total: alertas.length,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar alertas:`, error)
    return handleBlingError(error, requestId)
  }
}
