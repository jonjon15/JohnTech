import { type NextRequest, NextResponse } from "next/server"
import { handleBlingApiError, createBlingApiResponse } from "@/lib/bling-error-handler"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] GET produto ${params.id}`)

    const result = await sql`
      SELECT * FROM bling_products WHERE id = ${params.id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Produto não encontrado",
            response: { status: 404 },
          },
          "PRODUCT_NOT_FOUND",
        ),
        {
          status: 404,
          headers: {
            "x-bling-homologacao": "true",
            "x-request-id": requestId,
          },
        },
      )
    }

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Produto encontrado`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          data: result.rows[0],
        },
        elapsedTime,
        requestId,
      ),
      {
        headers: {
          "x-bling-homologacao": "true",
          "x-request-id": requestId,
        },
      },
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em GET produto:`, error)

    return NextResponse.json(handleBlingApiError(error, "GET_HOMOLOGACAO_PRODUTO"), {
      status: 500,
      headers: {
        "x-bling-homologacao": "true",
        "x-request-id": requestId,
      },
    })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] PUT produto ${params.id}`)

    const body = await request.json()
    const { nome, codigo, preco, descricao, situacao, tipo, formato } = body

    // Verificar se produto existe
    const existingResult = await sql`
      SELECT id FROM bling_products WHERE id = ${params.id}
    `

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Produto não encontrado",
            response: { status: 404 },
          },
          "PRODUCT_NOT_FOUND",
        ),
        {
          status: 404,
          headers: {
            "x-bling-homologacao": "true",
            "x-request-id": requestId,
          },
        },
      )
    }

    // Atualizar produto
    const result = await sql`
      UPDATE bling_products 
      SET nome = ${nome}, codigo = ${codigo}, preco = ${preco}, descricao = ${descricao},
          situacao = ${situacao}, tipo = ${tipo}, formato = ${formato}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Produto atualizado`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          data: result.rows[0],
        },
        elapsedTime,
        requestId,
      ),
      {
        headers: {
          "x-bling-homologacao": "true",
          "x-request-id": requestId,
        },
      },
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em PUT produto:`, error)

    return NextResponse.json(handleBlingApiError(error, "PUT_HOMOLOGACAO_PRODUTO"), {
      status: 500,
      headers: {
        "x-bling-homologacao": "true",
        "x-request-id": requestId,
      },
    })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] DELETE produto ${params.id}`)

    // Verificar se produto existe
    const existingResult = await sql`
      SELECT id FROM bling_products WHERE id = ${params.id}
    `

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Produto não encontrado",
            response: { status: 404 },
          },
          "PRODUCT_NOT_FOUND",
        ),
        {
          status: 404,
          headers: {
            "x-bling-homologacao": "true",
            "x-request-id": requestId,
          },
        },
      )
    }

    // Deletar produto
    await sql`DELETE FROM bling_products WHERE id = ${params.id}`

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Produto deletado`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          message: "Produto deletado com sucesso",
        },
        elapsedTime,
        requestId,
      ),
      {
        headers: {
          "x-bling-homologacao": "true",
          "x-request-id": requestId,
        },
      },
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em DELETE produto:`, error)

    return NextResponse.json(handleBlingApiError(error, "DELETE_HOMOLOGACAO_PRODUTO"), {
      status: 500,
      headers: {
        "x-bling-homologacao": "true",
        "x-request-id": requestId,
      },
    })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] PATCH produto ${params.id}`)

    const body = await request.json()
    const { situacao } = body

    if (!situacao) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Situação é obrigatória",
            response: { status: 400 },
          },
          "VALIDATION_ERROR",
        ),
        {
          status: 400,
          headers: {
            "x-bling-homologacao": "true",
            "x-request-id": requestId,
          },
        },
      )
    }

    // Verificar se produto existe
    const existingResult = await sql`
      SELECT id FROM bling_products WHERE id = ${params.id}
    `

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Produto não encontrado",
            response: { status: 404 },
          },
          "PRODUCT_NOT_FOUND",
        ),
        {
          status: 404,
          headers: {
            "x-bling-homologacao": "true",
            "x-request-id": requestId,
          },
        },
      )
    }

    // Atualizar situação
    const result = await sql`
      UPDATE bling_products 
      SET situacao = ${situacao}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Situação atualizada para: ${situacao}`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          data: result.rows[0],
        },
        elapsedTime,
        requestId,
      ),
      {
        headers: {
          "x-bling-homologacao": "true",
          "x-request-id": requestId,
        },
      },
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em PATCH produto:`, error)

    return NextResponse.json(handleBlingApiError(error, "PATCH_HOMOLOGACAO_PRODUTO"), {
      status: 500,
      headers: {
        "x-bling-homologacao": "true",
        "x-request-id": requestId,
      },
    })
  }
}
