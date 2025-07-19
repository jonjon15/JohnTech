import { type NextRequest, NextResponse } from "next/server"
import { BlingApiService } from "@/lib/bling-api-client"
import { createTablesIfNotExists } from "@/lib/db"

const userEmail = process.env.BLING_USER_EMAIL || "admin@johntech.com"

export async function GET(request: NextRequest) {
  try {
    await createTablesIfNotExists()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const blingService = new BlingApiService(userEmail)
    const response = await blingService.getPedidos(page, limit)

    if (!response.success) {
      return NextResponse.json(
        { error: "Failed to fetch orders", details: response.error },
        { status: response.error?.statusCode || 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      pagination: {
        page,
        limit,
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await createTablesIfNotExists()

    const body = await request.json()
    const blingService = new BlingApiService(userEmail)
    const response = await blingService.createPedido(body)

    if (!response.success) {
      return NextResponse.json(
        { error: "Failed to create order", details: response.error },
        { status: response.error?.statusCode || 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    })
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}
