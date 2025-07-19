import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError, logBlingApiCall } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()

  try {
    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "ID do produto deve ser um número válido",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    const result = await sql`
      SELECT * FROM bling_products WHERE id = ${productId}
    `

    if (result.rows.length === 0) {
      const duration = Date.now() - startTime
      logBlingApiCall("GET", `/homologacao/produtos/${productId}`, 404, duration)

      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "RESOURCE_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404 },
      )
    }

    const duration = Date.now() - startTime
    logBlingApiCall("GET", `/homologacao/produtos/${productId}`, 200, duration)

    return NextResponse.json(
      createBlingApiResponse(true, { data: result.rows[0] }, undefined, { elapsed_time: duration }),
      {
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
      },
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    logBlingApiCall("GET", `/homologacao/produtos/${params.id}`, 500, duration)

    const blingError = handleBlingApiError(error, "get-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()

  try {
    const productId = Number.parseInt(params.id)
    const body = await request.json()
    const { nome, codigo, preco, descricao, situacao } = body

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "ID do produto deve ser um número válido",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Validação de campos obrigatórios
    if (!nome || !codigo) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "MISSING_REQUIRED_FIELD",
          message: "Os campos 'nome' e 'codigo' são obrigatórios",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Verificar se produto existe
    const existingProduct = await sql`
      SELECT id FROM bling_products WHERE id = ${productId}
    `

    if (existingProduct.rows.length === 0) {
      const duration = Date.now() - startTime
      logBlingApiCall("PUT", `/homologacao/produtos/${productId}`, 404, duration)

      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "RESOURCE_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404 },
      )
    }

    // Verificar se código já existe em outro produto
    const duplicateCode = await sql`
      SELECT id FROM bling_products WHERE codigo = ${codigo} AND id != ${productId}
    `

    if (duplicateCode.rows.length > 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "Já existe outro produto com este código",
          statusCode: 422,
        }),
        { status: 422 },
      )
    }

    // Atualizar produto
    const result = await sql`
      UPDATE bling_products 
      SET nome = ${nome}, 
          codigo = ${codigo}, 
          preco = ${preco || 0}, 
          descricao = ${descricao || ""}, 
          situacao = ${situacao || "Ativo"},
          updated_at = NOW()
      WHERE id = ${productId}
      RETURNING *
    `

    const duration = Date.now() - startTime
    logBlingApiCall("PUT", `/homologacao/produtos/${productId}`, 200, duration)

    return NextResponse.json(
      createBlingApiResponse(true, { data: result.rows[0] }, undefined, { elapsed_time: duration }),
      {
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
      },
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    logBlingApiCall("PUT", `/homologacao/produtos/${params.id}`, 500, duration)

    const blingError = handleBlingApiError(error, "update-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()

  try {
    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "ID do produto deve ser um número válido",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Verificar se produto existe
    const existingProduct = await sql`
      SELECT id, nome, codigo FROM bling_products WHERE id = ${productId}
    `

    if (existingProduct.rows.length === 0) {
      const duration = Date.now() - startTime
      logBlingApiCall("DELETE", `/homologacao/produtos/${productId}`, 404, duration)

      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "RESOURCE_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404 },
      )
    }

    // Deletar produto
    await sql`
      DELETE FROM bling_products WHERE id = ${productId}
    `

    const duration = Date.now() - startTime
    logBlingApiCall("DELETE", `/homologacao/produtos/${productId}`, 200, duration)

    return NextResponse.json(
      createBlingApiResponse(
        true,
        {
          message: "Produto removido com sucesso",
          deleted_product: existingProduct.rows[0],
        },
        undefined,
        { elapsed_time: duration },
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
      },
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    logBlingApiCall("DELETE", `/homologacao/produtos/${params.id}`, 500, duration)

    const blingError = handleBlingApiError(error, "delete-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()

  try {
    const productId = Number.parseInt(params.id)
    const body = await request.json()
    const { situacao } = body

    if (isNaN(productId)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "ID do produto deve ser um número válido",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Validar situação
    if (!situacao || !["A", "I", "Ativo", "Inativo"].includes(situacao)) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "Situação deve ser 'A' (Ativo), 'I' (Inativo), 'Ativo' ou 'Inativo'",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Verificar se produto existe
    const existingProduct = await sql`
      SELECT id, nome FROM bling_products WHERE id = ${productId}
    `

    if (existingProduct.rows.length === 0) {
      const duration = Date.now() - startTime
      logBlingApiCall("PATCH", `/homologacao/produtos/${productId}`, 404, duration)

      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "RESOURCE_NOT_FOUND",
          message: "Produto não encontrado",
          statusCode: 404,
        }),
        { status: 404 },
      )
    }

    // Normalizar situação
    const situacaoNormalizada = situacao === "A" || situacao === "Ativo" ? "Ativo" : "Inativo"

    // Atualizar situação
    await sql`
      UPDATE bling_products 
      SET situacao = ${situacaoNormalizada}, updated_at = NOW()
      WHERE id = ${productId}
    `

    const duration = Date.now() - startTime
    logBlingApiCall("PATCH", `/homologacao/produtos/${productId}`, 200, duration)

    return NextResponse.json(
      createBlingApiResponse(
        true,
        {
          message: `Situação alterada para ${situacaoNormalizada}`,
          produto_id: productId,
          nova_situacao: situacaoNormalizada,
        },
        undefined,
        { elapsed_time: duration },
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
      },
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    logBlingApiCall("PATCH", `/homologacao/produtos/${params.id}`, 500, duration)

    const blingError = handleBlingApiError(error, "patch-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}
