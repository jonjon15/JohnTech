import { type NextRequest, NextResponse } from "next/server"
import { BlingApiClient } from "@/lib/bling-api-client"
import { BlingErrorHandler } from "@/lib/bling-error-handler"
import type { BlingSearchFilters } from "@/types/bling"

/**
 * API para gerenciar pedidos do Bling
 * https://developer.bling.com.br/referencia#/Pedidos%20de%20Venda
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Monta filtros de busca
    const filters: BlingSearchFilters = {
      pagina: searchParams.get("pagina") ? Number.parseInt(searchParams.get("pagina")!) : 1,
      limite: searchParams.get("limite") ? Number.parseInt(searchParams.get("limite")!) : 100,
      dataInicial: searchParams.get("dataInicial") || undefined,
      dataFinal: searchParams.get("dataFinal") || undefined,
      idSituacao: searchParams.get("idSituacao") ? Number.parseInt(searchParams.get("idSituacao")!) : undefined,
      idContato: searchParams.get("idContato") ? Number.parseInt(searchParams.get("idContato")!) : undefined,
    }

    console.log("🔍 Buscando pedidos:", filters)

    const response = await BlingApiClient.getOrders(filters)

    return NextResponse.json({
      success: true,
      data: response.data,
      pagination: {
        pagina: response.pagina,
        limite: response.limite,
        total: response.total,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao buscar pedidos:", error)

    const errorDetails = BlingErrorHandler.processApiError(error)
    const userMessage = BlingErrorHandler.getUserFriendlyMessage(error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorDetails.code,
          message: userMessage,
          details: errorDetails.description,
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    console.log("➕ Criando pedido:", orderData.numero || "novo")

    const order = await BlingApiClient.createOrder(orderData)

    return NextResponse.json({
      success: true,
      data: order,
      message: "Pedido criado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error)

    const errorDetails = BlingErrorHandler.processApiError(error)
    const userMessage = BlingErrorHandler.getUserFriendlyMessage(error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorDetails.code,
          message: userMessage,
          details: errorDetails.description,
        },
      },
      { status: 500 },
    )
  }
}
