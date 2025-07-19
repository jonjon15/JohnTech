import { type NextRequest, NextResponse } from "next/server"
import { getDashboardData } from "@/lib/analytics-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/analytics/dashboard", {})

    const dashboardData = await getDashboardData()

    return NextResponse.json({
      success: true,
      data: dashboardData,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar dados do dashboard:`, error)
    return handleBlingError(error, requestId)
  }
}
