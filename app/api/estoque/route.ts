import { type NextRequest, NextResponse } from "next/server"
import { getAllEstoque } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/estoque", {})

    const { searchParams } = new URL(request.url)

    const filters = {
      produtoNome: searchParams.get("produto") || undefined,
      depositoId: searchParams.get("deposito") ? Number.parseInt(searchParams.get("deposito")!) : undefined,
      estoqueMinimo: searchParams.get("estoque_minimo") === "true",
      estoqueZerado: searchParams.get("estoque_zerado") === "true",
    }

    const estoque = await getAllEstoque(filters)

    return NextResponse.json({
      success: true,
      data: estoque,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar estoque:`, error)
    return handleBlingError(error, requestId)
  }
}
