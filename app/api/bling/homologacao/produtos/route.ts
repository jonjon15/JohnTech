import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError, logBlingApiCall } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🔍 GET /api/bling/homologacao/produtos - Iniciando...")

    // Verificar se as tabelas existem
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('bling_products', 'bling_webhook_events', 'bling_auth_tokens')
    `

    const existingTables = tablesCheck.rows.map((row) => row.table_name)
    const requiredTables = ["bling_products", "bling_webhook_events", "bling_auth_tokens"]
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    if (missingTables.length > 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "MISSING_TABLES",
          message: `Tabelas não encontradas: ${missingTables.join(", ")}. Execute o script SQL primeiro.`,
          statusCode: 500,
        }),
        { status: 500 },
      )
    }

    // Buscar produtos locais com paginação
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number.parseInt(searchParams.get("limite") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("pagina") || "1") - 1

    const localProducts = await sql`
      SELECT * FROM bling_products 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset * limit}
    `

    // Contar total de produtos
    const countResult = await sql`
      SELECT COUNT(*) as total FROM bling_products
    `

    const total = Number.parseInt(countResult.rows[0].total)

    // Tentar buscar produtos do Bling (se autenticado)
    let blingProducts = { count: 0, items: [], error: null }
    try {
      const tokenCheck = await sql`
        SELECT access_token, expires_at 
        FROM bling_auth_tokens 
        WHERE user_email = 'admin@johntech.com' 
        AND expires_at > NOW()
        LIMIT 1
      `

      if (tokenCheck.rows.length > 0) {
        const blingResponse = await fetch(`https://www.bling.com.br/Api/v3/produtos?limite=${limit}`, {
          headers: {
            Authorization: `Bearer ${tokenCheck.rows[0].access_token}`,
            Accept: "application/json",
            "User-Agent": "BlingPro/1.0",
          },
          signal: AbortSignal.timeout(10000),
        })

        if (blingResponse.ok) {
          const blingData = await blingResponse.json()
          blingProducts = {
            count: blingData.data?.length || 0,
            items: blingData.data || [],
            error: null,
          }
        } else {
          blingProducts.error = `Erro ${blingResponse.status}: ${blingResponse.statusText}`
        }
      } else {
        blingProducts.error = "Token não encontrado ou expirado"
      }
    } catch (error: any) {
      blingProducts.error = error.message || "Erro ao conectar com Bling"
    }

    const responseData = {
      local_products: {
        count: localProducts.rows.length,
        total: total,
        items: localProducts.rows,
      },
      bling_products: blingProducts,
      database: {
        connection_ok: true,
        tables_exist: missingTables.length === 0,
      },
      api: {
        bling_connected: blingProducts.error === null,
        token_valid: blingProducts.error !== "Token não encontrado ou expirado",
      },
      pagination: {
        current_page: Math.floor(offset) + 1,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total_items: total,
      },
    }

    const duration = Date.now() - startTime
    logBlingApiCall("GET", "/homologacao/produtos", 200, duration)

    return NextResponse.json(createBlingApiResponse(true, responseData, undefined, { elapsed_time: duration }), {
      headers: {
        "Content-Type": "application/json",
        "x-bling-homologacao": "true",
        "x-total-count": total.toString(),
      },
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error("❌ Erro em GET produtos homologação:", error)

    logBlingApiCall("GET", "/homologacao/produtos", 500, duration)
    const blingError = handleBlingApiError(error, "get-homolog-products")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("➕ POST /api/bling/homologacao/produtos - Iniciando...")

    const body = await request.json()
    const { nome, codigo, preco, descricao, situacao } = body

    // Validação conforme documentação Bling
    if (!nome || !codigo) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "MISSING_REQUIRED_FIELD",
          message: "Os campos 'nome' e 'codigo' são obrigatórios",
          statusCode: 400,
          details: { required_fields: ["nome", "codigo"] },
        }),
        { status: 400 },
      )
    }

    // Verificar se código já existe
    const existingProduct = await sql`
      SELECT id FROM bling_products WHERE codigo = ${codigo}
    `

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "VALIDATION_ERROR",
          message: "Já existe um produto com este código",
          statusCode: 422,
          details: { field: "codigo", value: codigo },
        }),
        { status: 422 },
      )
    }

    // Inserir produto
    const result = await sql`
      INSERT INTO bling_products (nome, codigo, preco, descricao, situacao, tipo, formato)
      VALUES (
        ${nome}, 
        ${codigo}, 
        ${preco || 0}, 
        ${descricao || ""}, 
        ${situacao || "Ativo"},
        'P',
        'S'
      )
      RETURNING *
    `

    const newProduct = result.rows[0]
    const duration = Date.now() - startTime

    logBlingApiCall("POST", "/homologacao/produtos", 201, duration)

    return NextResponse.json(
      createBlingApiResponse(
        true,
        {
          data: {
            id: newProduct.id,
            nome: newProduct.nome,
            codigo: newProduct.codigo,
            preco: newProduct.preco,
            descricao: newProduct.descricao,
            situacao: newProduct.situacao,
          },
        },
        undefined,
        { elapsed_time: duration },
      ),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
          Location: `/api/bling/homologacao/produtos/${newProduct.id}`,
        },
      },
    )
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error("❌ Erro em POST produto homologação:", error)

    logBlingApiCall("POST", "/homologacao/produtos", 500, duration)
    const blingError = handleBlingApiError(error, "create-homolog-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}
