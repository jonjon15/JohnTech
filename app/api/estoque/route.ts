import { type NextRequest, NextResponse } from "next/server"
import { getAllEstoque } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const { searchParams } = new URL(request.url)
    const produtoNome = searchParams.get("produto")
    const depositoId = searchParams.get("deposito") ? Number.parseInt(searchParams.get("deposito")!) : undefined
    const estoqueMinimo = searchParams.get("estoque_minimo") === "true"
    const estoqueZerado = searchParams.get("estoque_zerado") === "true"

    logRequest(requestId, "GET", "/api/estoque", { produtoNome, depositoId, estoqueMinimo, estoqueZerado })

    const estoque = await getAllEstoque({
      produtoNome: produtoNome || undefined,
      depositoId,
      estoqueMinimo,
      estoqueZerado,
    })

    return NextResponse.json({
      success: true,
      data: estoque,
      total: estoque.length,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar estoque:`, error)
    return handleBlingError(error, requestId)
  }
}
