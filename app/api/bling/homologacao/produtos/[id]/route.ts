import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "INVALID_ID",
          message: "ID do produto inválido",
          statusCode: 400,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log(`🗑️ DELETE /api/bling/homologacao/produtos/${productId} - Iniciando...`)

    // Verificar se o produto existe
    const existingProduct = await sql`
      SELECT id, nome, codigo FROM bling_products WHERE id = ${productId}
    `

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "PRODUCT_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      )
    }

    // Deletar o produto
    await sql`
      DELETE FROM bling_products WHERE id = ${productId}
    `

    const product = existingProduct.rows[0]
    console.log(`✅ Produto deletado: ${product.nome} (ID: ${productId})`)

    return NextResponse.json(
      createBlingApiResponse(true, {
        message: "Produto removido com sucesso",
        deleted_product: {
          id: productId,
          nome: product.nome,
          codigo: product.codigo,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": crypto.randomUUID(),
        },
      },
    )
  } catch (error: any) {
    console.error(`❌ Erro em DELETE produto ${params.id}:`, error)

    const blingError = handleBlingApiError(error, "delete-homolog-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "INVALID_ID",
          message: "ID do produto inválido",
          statusCode: 400,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log(`✏️ PUT /api/bling/homologacao/produtos/${productId} - Iniciando...`)

    const body = await request.json()
    const { nome, codigo, preco, descricao } = body

    if (!nome || !codigo) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "Nome e código são obrigatórios",
          statusCode: 400,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Verificar se o produto existe
    const existingProduct = await sql`
      SELECT id FROM bling_products WHERE id = ${productId}
    `

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "PRODUCT_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      )
    }

    // Verificar se código já existe em outro produto
    const duplicateCode = await sql`
      SELECT id FROM bling_products WHERE codigo = ${codigo} AND id != ${productId}
    `

    if (duplicateCode.rows.length > 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "DUPLICATE_CODE",
          message: "Já existe outro produto com este código",
          statusCode: 409,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      )
    }

    // Atualizar produto
    const result = await sql`
      UPDATE bling_products 
      SET nome = ${nome}, codigo = ${codigo}, preco = ${preco || 0}, 
          descricao = ${descricao || ""}, updated_at = NOW()
      WHERE id = ${productId}
      RETURNING *
    `

    const updatedProduct = result.rows[0]
    console.log(`✅ Produto atualizado: ${updatedProduct.nome} (ID: ${productId})`)

    return NextResponse.json(
      createBlingApiResponse(true, {
        message: "Produto atualizado com sucesso",
        produto: updatedProduct,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": crypto.randomUUID(),
        },
      },
    )
  } catch (error: any) {
    console.error(`❌ Erro em PUT produto ${params.id}:`, error)

    const blingError = handleBlingApiError(error, "update-homolog-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "INVALID_ID",
          message: "ID do produto inválido",
          statusCode: 400,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log(`🔄 PATCH /api/bling/homologacao/produtos/${productId} - Iniciando...`)

    const body = await request.json()
    const { situacao } = body

    if (!situacao || !["A", "I"].includes(situacao)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "Situação deve ser 'A' (Ativo) ou 'I' (Inativo)",
          statusCode: 400,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Verificar se o produto existe
    const existingProduct = await sql`
      SELECT id, nome FROM bling_products WHERE id = ${productId}
    `

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "PRODUCT_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      )
    }

    // Atualizar situação
    const situacaoTexto = situacao === "A" ? "Ativo" : "Inativo"
    await sql`
      UPDATE bling_products 
      SET situacao = ${situacaoTexto}, updated_at = NOW()
      WHERE id = ${productId}
    `

    const product = existingProduct.rows[0]
    console.log(`✅ Situação do produto alterada: ${product.nome} -> ${situacaoTexto}`)

    return NextResponse.json(
      createBlingApiResponse(true, {
        message: `Situação alterada para ${situacaoTexto}`,
        produto_id: productId,
        nova_situacao: situacaoTexto,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": crypto.randomUUID(),
        },
      },
    )
  } catch (error: any) {
    console.error(`❌ Erro em PATCH produto ${params.id}:`, error)

    const blingError = handleBlingApiError(error, "patch-homolog-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
