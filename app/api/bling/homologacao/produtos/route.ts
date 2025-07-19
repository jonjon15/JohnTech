import type { NextRequest } from "next/server"
import pool from "@/lib/db" // Importação padrão do pool
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler" // Exportações nomeadas
import { createProduct } from "@/lib/db"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  logBlingApiCall(requestId, "GET", "/api/bling/homologacao/produtos", {})

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramCount = 1

    if (search) {
      whereClause += ` AND (nome ILIKE $${paramCount} OR codigo ILIKE $${paramCount})`
      params.push(`%${search}%`)
      paramCount++
    }

    // Buscar produtos do banco de dados local
    const produtosQuery = `
      SELECT 
        id,
        bling_id,
        codigo,
        nome,
        descricao,
        preco::numeric as preco,
        categoria,
        situacao,
        tipo,
        formato,
        descricao_complementar,
        unidade,
        peso_liquido::numeric as peso_liquido,
        peso_bruto::numeric as peso_bruto,
        volumes,
        itens_por_caixa,
        gtin,
        gtin_embalagem,
        marca,
        cest,
        ncm,
        origem,
        created_at,
        updated_at
      FROM bling_products 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `
    params.push(limit, offset)

    const produtosResult = await pool.query(produtosQuery, params)

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM bling_products ${whereClause}`
    const countResult = await pool.query(countQuery, params.slice(0, -2))
    const total = Number.parseInt(countResult.rows[0].total)

    const produtos = produtosResult.rows.map((produto) => ({
      ...produto,
      preco: Number.parseFloat(produto.preco || "0"),
      peso_liquido: Number.parseFloat(produto.peso_liquido || "0"),
      peso_bruto: Number.parseFloat(produto.peso_bruto || "0"),
    }))

    return createBlingApiResponse(
      true,
      {
        produtos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      null,
      requestId,
    )
  } catch (error) {
    return handleBlingApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const body = await request.json()
  logBlingApiCall(requestId, "POST", "/api/bling/homologacao/produtos", body)

  try {
    if (!body.nome || !body.codigo) {
      return NextResponse.json(
        { success: false, error: { message: "Nome e código são obrigatórios" } },
        { status: 400 },
      )
    }

    const productData = {
      ...body,
      preco: typeof body.preco === "string" ? Number.parseFloat(body.preco) : body.preco || 0,
    }

    // Verificar se código já existe no banco de dados local
    const existingProduct = await pool.query("SELECT id FROM bling_products WHERE codigo = $1", [productData.codigo])

    if (existingProduct.rows.length > 0) {
      return createBlingApiResponse(
        false,
        null,
        {
          code: "DUPLICATE_CODE",
          message: "Já existe um produto com este código no banco de dados local.",
          statusCode: 409,
        },
        requestId,
      )
    }

    const produto = await createProduct(productData)
    return NextResponse.json({ success: true, data: produto })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ success: false, error: { message: "Erro ao criar produto" } }, { status: 500 })
  }
}
