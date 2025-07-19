import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/db"
import { handleBlingApiError, createBlingApiResponse } from "@/lib/bling-error-handler"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  const requestId = randomUUID()
  const startTime = Date.now()

  try {
    console.log(`🔍 [${requestId}] GET /api/bling/homologacao/produtos - Listando produtos...`)

    const products = await getProducts()
    const elapsedTime = Date.now() - startTime

    console.log(`✅ [${requestId}] ${products.length} produtos encontrados (${elapsedTime}ms)`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          produtos: products.map((product) => ({
            id: product.id,
            nome: product.nome,
            descricao: product.descricao || "",
            preco: typeof product.preco === "number" ? product.preco.toFixed(2) : "0.00",
            estoque: product.estoque,
            bling_id: product.bling_id,
            created_at: product.created_at,
            updated_at: product.updated_at,
          })),
          total: products.length,
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error) {
    const errorResponse = handleBlingApiError(error, `GET_PRODUCTS_${requestId}`)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const startTime = Date.now()

  try {
    console.log(`📝 [${requestId}] POST /api/bling/homologacao/produtos - Criando produto...`)

    const body = await request.json()
    const { nome, descricao, preco, estoque } = body

    // Validação básica
    if (!nome || typeof nome !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Nome é obrigatório e deve ser uma string",
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

    const newProduct = await createProduct({
      nome: nome.trim(),
      descricao: descricao?.trim() || "",
      preco: preco || 0,
      estoque: estoque || 0,
      bling_id: null,
    })

    if (!newProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREATE_ERROR",
            message: "Erro ao criar produto no banco de dados",
            status: 500,
          },
        },
        { status: 500 },
      )
    }

    const elapsedTime = Date.now() - startTime

    console.log(`✅ [${requestId}] Produto criado: ${newProduct.id} - ${newProduct.nome} (${elapsedTime}ms)`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          produto: {
            id: newProduct.id,
            nome: newProduct.nome,
            descricao: newProduct.descricao || "",
            preco: typeof newProduct.preco === "number" ? newProduct.preco.toFixed(2) : "0.00",
            estoque: newProduct.estoque,
            bling_id: newProduct.bling_id,
            created_at: newProduct.created_at,
            updated_at: newProduct.updated_at,
          },
        },
        elapsedTime,
        requestId,
      ),
      { status: 201 },
    )
  } catch (error) {
    const errorResponse = handleBlingApiError(error, `CREATE_PRODUCT_${requestId}`)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}
