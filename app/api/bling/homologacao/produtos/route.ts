import { type NextRequest, NextResponse } from "next/server"
import { handleBlingApiError, createBlingApiResponse } from "@/lib/bling-error-handler"
import { sql } from "@vercel/postgres"

const userEmail = "admin@johntech.com"
const REQUEST_TIMEOUT = 10000

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] GET /api/bling/homologacao/produtos - INÍCIO`)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const situacao = searchParams.get("situacao")

    // Buscar produtos locais para homologação
    let query = `
      SELECT id, bling_id, nome, codigo, preco, descricao, situacao, tipo, formato, 
             created_at, updated_at
      FROM bling_products 
      WHERE 1=1
    `
    const params: any[] = []

    if (situacao) {
      query += ` AND situacao = $${params.length + 1}`
      params.push(situacao)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, (page - 1) * limit)

    const result = await sql.query(query, params)
    const produtos = result.rows

    // Contar total
    let countQuery = `SELECT COUNT(*) as total FROM bling_products WHERE 1=1`
    const countParams: any[] = []

    if (situacao) {
      countQuery += ` AND situacao = $${countParams.length + 1}`
      countParams.push(situacao)
    }

    const countResult = await sql.query(countQuery, countParams)
    const total = Number.parseInt(countResult.rows[0].total)

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] ${produtos.length} produtos encontrados`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          data: produtos,
          meta: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
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
    console.error(`❌ [${requestId}] Erro em GET produtos:`, error)

    return NextResponse.json(handleBlingApiError(error, "GET_HOMOLOGACAO_PRODUTOS"), {
      status: 500,
      headers: {
        "x-bling-homologacao": "true",
        "x-request-id": requestId,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] POST /api/bling/homologacao/produtos - INÍCIO`)

    const body = await request.json()
    const { nome, codigo, preco, descricao, situacao = "Ativo", tipo = "P", formato = "S" } = body

    // Validações obrigatórias
    if (!nome || !codigo) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Nome e código são obrigatórios",
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

    // Verificar se código já existe
    const existingResult = await sql`
      SELECT id FROM bling_products WHERE codigo = ${codigo}
    `

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        handleBlingApiError(
          {
            message: "Código já existe",
            response: { status: 409 },
          },
          "DUPLICATE_CODE",
        ),
        {
          status: 409,
          headers: {
            "x-bling-homologacao": "true",
            "x-request-id": requestId,
          },
        },
      )
    }

    // Inserir produto
    const result = await sql`
      INSERT INTO bling_products (nome, codigo, preco, descricao, situacao, tipo, formato, created_at, updated_at)
      VALUES (${nome}, ${codigo}, ${preco || 0}, ${descricao || ""}, ${situacao}, ${tipo}, ${formato}, NOW(), NOW())
      RETURNING *
    `

    const produto = result.rows[0]
    const elapsedTime = Date.now() - startTime

    console.log(`✅ [${requestId}] Produto criado: ${produto.id}`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          data: produto,
        },
        elapsedTime,
        requestId,
      ),
      {
        status: 201,
        headers: {
          "x-bling-homologacao": "true",
          "x-request-id": requestId,
        },
      },
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em POST produto:`, error)

    return NextResponse.json(handleBlingApiError(error, "POST_HOMOLOGACAO_PRODUTO"), {
      status: 500,
      headers: {
        "x-bling-homologacao": "true",
        "x-request-id": requestId,
      },
    })
  }
}
