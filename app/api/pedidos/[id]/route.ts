import { type NextRequest, NextResponse } from "next/server"
import { getPedidoById, updatePedidoSituacao, getPedidoHistorico } from "@/lib/pedidos-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", `/api/pedidos/${params.id}`, {})

    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID inválido",
          requestId,
        },
        { status: 400 },
      )
    }

    const pedido = await getPedidoById(id)

    if (!pedido) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido não encontrado",
          requestId,
        },
        { status: 404 },
      )
    }

    // Buscar histórico
    const historico = await getPedidoHistorico(id)

    return NextResponse.json({
      success: true,
      data: {
        ...pedido,
        historico,
      },
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar pedido:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "PATCH", `/api/pedidos/${params.id}`, {})

    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID inválido",
          requestId,
        },
        { status: 400 },
      )
    }

    const body = await request.json()

    if (body.situacao) {
      await updatePedidoSituacao(id, body.situacao, body.observacoes, body.usuario)
    }

    const pedido = await getPedidoById(id)

    return NextResponse.json({
      success: true,
      data: pedido,
      message: "Pedido atualizado com sucesso",
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao atualizar pedido:`, error)
    return handleBlingError(error, requestId)
  }
}
