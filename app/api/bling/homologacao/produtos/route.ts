import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
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
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Buscar produtos locais
    const localProducts = await sql`
      SELECT * FROM bling_products 
      ORDER BY created_at DESC
    `

    // Tentar buscar produtos do Bling (se autenticado)
    let blingProducts = { count: 0, items: [], error: null }
    try {
      // Verificar se há token válido
      const tokenCheck = await sql`
        SELECT access_token, expires_at 
        FROM bling_auth_tokens 
        WHERE user_email = 'admin@johntech.com' 
        AND expires_at > NOW()
        LIMIT 1
      `

      if (tokenCheck.rows.length > 0) {
        // Fazer requisição para API do Bling
        const blingResponse = await fetch("https://www.bling.com.br/Api/v3/produtos?limite=10", {
          headers: {
            Authorization: `Bearer ${tokenCheck.rows[0].access_token}`,
            Accept: "application/json",
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
    }

    console.log(`✅ Dados carregados: ${localProducts.rows.length} produtos locais, ${blingProducts.count} do Bling`)

    return NextResponse.json(createBlingApiResponse(true, responseData), {
      headers: {
        "Content-Type": "application/json",
        "x-bling-homologacao": crypto.randomUUID(),
      },
    })
  } catch (error: any) {
    console.error("❌ Erro em GET produtos homologação:", error)

    const blingError = handleBlingApiError(error, "get-homolog-products")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("➕ POST /api/bling/homologacao/produtos - Iniciando...")

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

    // Verificar se código já existe
    const existingProduct = await sql`
      SELECT id FROM bling_products WHERE codigo = ${codigo}
    `

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "DUPLICATE_CODE",
          message: "Já existe um produto com este código",
          statusCode: 409,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      )
    }

    // Inserir produto
    const result = await sql`
      INSERT INTO bling_products (nome, codigo, preco, descricao, situacao)
      VALUES (${nome}, ${codigo}, ${preco || 0}, ${descricao || ""}, 'Ativo')
      RETURNING *
    `

    const newProduct = result.rows[0]
    console.log(`✅ Produto criado: ${newProduct.nome} (ID: ${newProduct.id})`)

    return NextResponse.json(
      createBlingApiResponse(true, {
        data: {
          id: newProduct.id,
          nome: newProduct.nome,
          preco: newProduct.preco,
          codigo: newProduct.codigo,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": crypto.randomUUID(),
        },
      },
    )
  } catch (error: any) {
    console.error("❌ Erro em POST produto homologação:", error)

    const blingError = handleBlingApiError(error, "create-homolog-product")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
