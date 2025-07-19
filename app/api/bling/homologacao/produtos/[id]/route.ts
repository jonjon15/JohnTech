import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db"
import { handleBlingApiError, createBlingApiResponse } from "@/lib/bling-error-handler"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = randomUUID()
  const startTime = Date.now()

  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "ID deve ser um número válido",
            status: 400,
          },
        },
        { status: 400 },
      )
    }

    console.log(`🔍 [${requestId}] GET /api/bling/homologacao/produtos/${id} - Buscando produto...`)

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Produto não encontrado",
            status: 404,
          },
        },
        { status: 404 },
      )
    }

    const elapsedTime = Date.now() - startTime

    console.log(`✅ [${requestId}] Produto encontrado: ${product.nome} (${elapsedTime}ms)`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          produto: {
            id: product.id,
            nome: product.nome,
            descricao: product.descricao || "",
            preco: typeof product.preco === "number" ? product.preco.toFixed(2) : "0.00",
            estoque: product.estoque,
            bling_id: product.bling_id,
            created_at: product.created_at,
            updated_at: product.updated_at,
          },
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error) {
    const errorResponse = handleBlingApiError(error, `GET_PRODUCT_${requestId}`)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = randomUUID()
  const startTime = Date.now()

  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "ID deve ser um número válido",
            status: 400,
          },
        },
        { status: 400 },
      )
    }

    console.log(`📝 [${requestId}] PUT /api/bling/homologacao/produtos/${id} - Atualizando produto...`)

    const body = await request.json()
    const { nome, descricao, preco, estoque } = body

    // Validação básica
    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Nome deve ser uma string não vazia",
            status: 400,
          },
        },
        { status: 400 },
      )
    }

    if (preco !== undefined && (typeof preco !== "number" || preco < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Preço deve ser um número positivo",
            status: 400,
          },
        },
        { status: 400 },
      )
    }

    if (estoque !== undefined && (typeof estoque !== "number" || estoque < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Estoque deve ser um número positivo",
            status: 400,
          },
        },
        { status: 400 },
      )
    }

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome.trim()
    if (descricao !== undefined) updateData.descricao = descricao?.trim() || ""
    if (preco !== undefined) updateData.preco = preco
    if (estoque !== undefined) updateData.estoque = estoque

    const updatedProduct = await updateProduct(id, updateData)

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Produto não encontrado ou erro ao atualizar",
            status: 404,
          },
        },
        { status: 404 },
      )
    }

    const elapsedTime = Date.now() - startTime

    console.log(`✅ [${requestId}] Produto atualizado: ${updatedProduct.nome} (${elapsedTime}ms)`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          produto: {
            id: updatedProduct.id,
            nome: updatedProduct.nome,
            descricao: updatedProduct.descricao || "",
            preco: typeof updatedProduct.preco === "number" ? updatedProduct.preco.toFixed(2) : "0.00",
            estoque: updatedProduct.estoque,
            bling_id: updatedProduct.bling_id,
            created_at: updatedProduct.created_at,
            updated_at: updatedProduct.updated_at,
          },
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error) {
    const errorResponse = handleBlingApiError(error, `UPDATE_PRODUCT_${requestId}`)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = randomUUID()
  const startTime = Date.now()

  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "ID deve ser um número válido",
            status: 400,
          },
        },
        { status: 400 },
      )
    }

    console.log(`🗑️ [${requestId}] DELETE /api/bling/homologacao/produtos/${id} - Deletando produto...`)

    const deleted = await deleteProduct(id)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Produto não encontrado",
            status: 404,
          },
        },
        { status: 404 },
      )
    }

    const elapsedTime = Date.now() - startTime

    console.log(`✅ [${requestId}] Produto deletado: ID ${id} (${elapsedTime}ms)`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          message: "Produto deletado com sucesso",
          id: id,
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error) {
    const errorResponse = handleBlingApiError(error, `DELETE_PRODUCT_${requestId}`)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}
