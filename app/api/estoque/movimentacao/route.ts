import { type NextRequest, NextResponse } from "next/server"
import { movimentarEstoque, getMovimentacoesEstoque } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const { searchParams } = new URL(request.url)
    const produtoId = searchParams.get("produto_id") ? Number.parseInt(searchParams.get("produto_id")!) : undefined
    const depositoId = searchParams.get("deposito_id") ? Number.parseInt(searchParams.get("deposito_id")!) : undefined
    const dataInicio = searchParams.get("data_inicio") ? new Date(searchParams.get("data_inicio")!) : undefined
    const dataFim = searchParams.get("data_fim") ? new Date(searchParams.get("data_fim")!) : undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50

    logRequest(requestId, "GET", "/api/estoque/movimentacao", { produtoId, depositoId, dataInicio, dataFim, limit })

    const movimentacoes = await getMovimentacoesEstoque(produtoId, depositoId, dataInicio, dataFim, limit)

    return NextResponse.json({
      success: true,
      data: movimentacoes,
      total: movimentacoes.length,
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
    const body = await request.json()
    logRequest(requestId, "POST", "/api/estoque/movimentacao", body)

    // Validar dados obrigatórios
    if (!body.produto_id || !body.deposito_id || !body.tipo_movimentacao || body.quantidade === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto, depósito, tipo de movimentação e quantidade são obrigatórios",
          requestId,
        },
        { status: 400 },
      )
    }

    const movimentacao = await movimentarEstoque({
      produto_id: body.produto_id,
      deposito_id: body.deposito_id,
      tipo_movimentacao: body.tipo_movimentacao,
      quantidade: Number.parseFloat(body.quantidade),
      quantidade_anterior: 0, // Será calculado na função
      quantidade_nova: body.quantidade_nova ? Number.parseFloat(body.quantidade_nova) : 0,
      custo_unitario: body.custo_unitario ? Number.parseFloat(body.custo_unitario) : 0,
      valor_total: body.valor_total ? Number.parseFloat(body.valor_total) : 0,
      motivo: body.motivo,
      documento: body.documento,
      usuario_id: body.usuario_id,
      observacoes: body.observacoes,
    })

    return NextResponse.json(
      {
        success: true,
        data: movimentacao,
        message: "Movimentação realizada com sucesso",
        requestId,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error(`[${requestId}] Erro ao movimentar estoque:`, error)
    return handleBlingError(error, requestId)
  }
}
