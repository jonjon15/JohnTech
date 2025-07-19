import { type NextRequest, NextResponse } from "next/server"
import { gerarRelatorioVendas } from "@/lib/analytics-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"
import type { RelatorioFiltros } from "@/types/analytics"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/analytics/relatorios", {})

    const { searchParams } = new URL(request.url)

    const filtros: RelatorioFiltros = {
      data_inicio: searchParams.get("data_inicio") ? new Date(searchParams.get("data_inicio")!) : undefined,
      data_fim: searchParams.get("data_fim") ? new Date(searchParams.get("data_fim")!) : undefined,
      vendedor: searchParams.get("vendedor") || undefined,
      cliente_id: searchParams.get("cliente_id") ? Number.parseInt(searchParams.get("cliente_id")!) : undefined,
      categoria: searchParams.get("categoria") || undefined,
      situacao: searchParams.get("situacao") || undefined,
    }

    const relatorio = await gerarRelatorioVendas(filtros)

    return NextResponse.json({
      success: true,
      data: relatorio,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao gerar relatório:`, error)
    return handleBlingError(error, requestId)
  }
}
