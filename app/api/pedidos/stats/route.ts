import { type NextRequest, NextResponse } from "next/server"
import { getPedidoStats } from "../../../../lib/pedidos-db"
import { handleBlingError, createBlingApiResponse, logRequest } from "../../../../lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    logRequest(requestId, "GET", "/api/pedidos/stats")

    const stats = await getPedidoStats()

    return NextResponse.json(createBlingApiResponse(stats, requestId))
  } catch (error) {
    return handleBlingError(error, requestId)
  }
}
