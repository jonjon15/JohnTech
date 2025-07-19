import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct, type BlingProduct } from "@/lib/db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID inválido",
          requestId,
        },
        { status: 400 },
      )
    }

    logRequest(requestId, "GET", `/api/bling/homologacao/produtos/${id}`, {})

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
          requestId,
        },
        { status: 404 },
      )
    }

    console.log(`[${requestId}] Product found:`, product)

    return NextResponse.json({
      success: true,
      data: product,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Error fetching product:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
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
    logRequest(requestId, "PUT", `/api/bling/homologacao/produtos/${id}`, body)

    // Preparar dados para atualização
    const updateData: Partial<BlingProduct> = {}

    if (body.bling_id !== undefined) updateData.bling_id = body.bling_id
    if (body.nome !== undefined) updateData.nome = body.nome
    if (body.codigo !== undefined) updateData.codigo = body.codigo
    if (body.preco !== undefined) updateData.preco = Number.parseFloat(body.preco)
    if (body.descricao_curta !== undefined) updateData.descricao_curta = body.descricao_curta
    if (body.situacao !== undefined) updateData.situacao = body.situacao
    if (body.tipo !== undefined) updateData.tipo = body.tipo
    if (body.formato !== undefined) updateData.formato = body.formato

    const product = await updateProduct(id, updateData)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
          requestId,
        },
        { status: 404 },
      )
    }

    console.log(`[${requestId}] Product updated:`, product)

    return NextResponse.json({
      success: true,
      data: product,
      message: "Produto atualizado com sucesso",
      requestId,
    })
  } catch (error: any) {
    console.error(`[${requestId}] Error updating product:`, error)

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID inválido",
          requestId,
        },
        { status: 400 },
      )
    }

    logRequest(requestId, "DELETE", `/api/bling/homologacao/produtos/${id}`, {})

    const deleted = await deleteProduct(id)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
          requestId,
        },
        { status: 404 },
      )
    }

    console.log(`[${requestId}] Product deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: "Produto excluído com sucesso",
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Error deleting product:`, error)
    return handleBlingError(error, requestId)
  }
}
