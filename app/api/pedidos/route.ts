import { type NextRequest, NextResponse } from "next/server"
import { getAllPedidos, createPedido } from "@/lib/pedidos-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"
import type { PedidoFilters } from "@/types/pedidos"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/pedidos", {})

    const { searchParams } = new URL(request.url)

    const filters: PedidoFilters = {
      cliente_id: searchParams.get("cliente_id") ? Number.parseInt(searchParams.get("cliente_id")!) : undefined,
      situacao:
        searchParams.get("situacao") && searchParams.get("situacao") !== "all"
          ? searchParams.get("situacao")!
          : undefined,
      data_inicio: searchParams.get("data_inicio") ? new Date(searchParams.get("data_inicio")!) : undefined,
      data_fim: searchParams.get("data_fim") ? new Date(searchParams.get("data_fim")!) : undefined,
      vendedor: searchParams.get("vendedor") || undefined,
      forma_pagamento: searchParams.get("forma_pagamento") || undefined,
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50,
    }

    const { pedidos, total } = await getAllPedidos(filters)
    const totalPages = Math.ceil(total / (filters.limit || 50))

    return NextResponse.json({
      success: true,
      data: {
        pedidos,
        total,
        totalPages,
        currentPage: filters.page || 1,
      },
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar pedidos:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/pedidos", {})

    const body = await request.json()

    const pedido = await createPedido(body)

    return NextResponse.json({
      success: true,
      data: pedido,
      message: "Pedido criado com sucesso",
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao criar pedido:`, error)
    return handleBlingError(error, requestId)
  }
}
