import { type NextRequest, NextResponse } from "next/server"
import { getMovimentacoesEstoque, movimentarEstoque } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/estoque/movimentacao", {})

    const { searchParams } = new URL(request.url)

    const produtoId = searchParams.get("produto_id") ? Number.parseInt(searchParams.get("produto_id")!) : undefined
    const depositoId = searchParams.get("deposito_id") ? Number.parseInt(searchParams.get("deposito_id")!) : undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50

    const movimentacoes = await getMovimentacoesEstoque(produtoId, depositoId, undefined, undefined, limit)

    return NextResponse.json({
      success: true,
      data: movimentacoes,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar movimentações:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/estoque/movimentacao", {})

    const body = await request.json()

    const movimentacao = await movimentarEstoque({
      produto_id: body.produto_id,
      deposito_id: body.deposito_id,
      tipo_movimentacao: body.tipo_movimentacao,
      quantidade: body.quantidade,
      quantidade_anterior: 0, // Será calculado na função
      quantidade_nova: body.quantidade_nova || 0,
      custo_unitario: body.custo_unitario || 0,
      valor_total: (body.quantidade || 0) * (body.custo_unitario || 0),
      motivo: body.motivo,
      observacoes: body.observacoes,
      usuario_id: "Sistema",
    })

    return NextResponse.json({
      success: true,
      data: movimentacao,
      message: "Movimentação realizada com sucesso",
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao criar movimentação:`, error)
    return handleBlingError(error, requestId)
  }
}
