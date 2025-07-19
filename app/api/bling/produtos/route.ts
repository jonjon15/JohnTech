import { type NextRequest, NextResponse } from "next/server"
import { BlingApiClient } from "@/lib/bling-api-client"
import { BlingErrorHandler } from "@/lib/bling-error-handler"
import type { BlingSearchFilters } from "@/types/bling"

/**
 * API para gerenciar produtos do Bling
 * https://developer.bling.com.br/referencia#/Produtos
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Monta filtros de busca
    const filters: BlingSearchFilters = {
      pagina: searchParams.get("pagina") ? Number.parseInt(searchParams.get("pagina")!) : 1,
      limite: searchParams.get("limite") ? Number.parseInt(searchParams.get("limite")!) : 100,
      criterio: searchParams.get("criterio") || undefined,
      tipo: searchParams.get("tipo") || undefined,
      situacao: searchParams.get("situacao") || undefined,
      codigo: searchParams.get("codigo") || undefined,
      dataInicial: searchParams.get("dataInicial") || undefined,
      dataFinal: searchParams.get("dataFinal") || undefined,
      idCategoria: searchParams.get("idCategoria") ? Number.parseInt(searchParams.get("idCategoria")!) : undefined,
    }

    console.log("🔍 Buscando produtos:", filters)

    const response = await BlingApiClient.getProducts(filters)

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
    console.error("❌ Erro ao buscar produtos:", error)

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
    const productData = await request.json()

    console.log("➕ Criando produto:", productData.nome)

    const product = await BlingApiClient.createProduct(productData)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Produto criado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro ao criar produto:", error)

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
