import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, createProduct, type BlingProduct } from "@/lib/db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/bling/homologacao/produtos", {})

    const products = await getAllProducts()

    console.log(`[${requestId}] Found ${products.length} products`)

    // Fix: Return products under data.produtos to match frontend expectations
    return NextResponse.json({
      success: true,
      data: { produtos: products },
      total: products.length,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Error fetching products:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const body = await request.json()
    logRequest(requestId, "POST", "/api/bling/homologacao/produtos", body)

    // Validar dados obrigatórios
    if (!body.nome || !body.codigo) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome e código são obrigatórios",
          requestId,
        },
        { status: 400 },
      )
    }

    // Preparar dados do produto
    const productData: Omit<BlingProduct, "id" | "created_at" | "updated_at"> = {
      bling_id: body.bling_id || null,
      nome: body.nome,
      codigo: body.codigo,
      preco: Number.parseFloat(body.preco) || 0,
      descricao_curta: body.descricao_curta || null,
      situacao: body.situacao || "Ativo",
      tipo: body.tipo || "P",
      formato: body.formato || "S",
    }

    const product = await createProduct(productData)

    console.log(`[${requestId}] Product created:`, product)

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Produto criado com sucesso",
        requestId,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error(`[${requestId}] Error creating product:`, error)

    // Tratar erro de código duplicado
    if (error.code === "23505" && error.constraint === "idx_bling_products_codigo") {
      return NextResponse.json(
        {
          success: false,
          error: "Código do produto já existe",
          requestId,
        },
        { status: 409 },
      )
    }

    return handleBlingError(error, requestId)
  }
}
