import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

const userEmail = "admin@johntech.com"
const REQUEST_TIMEOUT = 8000

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔍 [${requestId}] GET /api/bling/products - INÍCIO`)

    const { searchParams } = new URL(request.url)
    const limite = searchParams.get("limite") || "100"
    const pagina = searchParams.get("pagina") || "1"
    const criterio = searchParams.get("criterio") || "1" // 1=ID, 2=Nome, 3=Código
    const tipo = searchParams.get("tipo") || "T" // T=Todos, P=Produto, S=Serviço

    // Obter token válido
    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "GET_PRODUCTS"), { status: 401 })
    }

    // Construir URL da API Bling
    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = new URL(`${blingApiUrl}/produtos`)
    url.searchParams.set("limite", limite)
    url.searchParams.set("pagina", pagina)
    url.searchParams.set("criterio", criterio)
    url.searchParams.set("tipo", tipo)

    console.log(`📡 [${requestId}] Chamando: ${url.toString()}`)

    // Fazer requisição com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("GET", url.pathname, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro ${response.status}:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "GET_PRODUCTS"),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produtos obtidos: ${data.data?.length || 0}`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em GET products:`, error)

    return NextResponse.json(handleBlingApiError(error, "GET_PRODUCTS"), { status: 500 })
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`➕ [${requestId}] POST /api/bling/products - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "CREATE_PRODUCT"), {
        status: 401,
      })
    }

    const productData = await request.json()
    console.log(`📝 [${requestId}] Dados do produto:`, JSON.stringify(productData, null, 2))

    // Validar dados obrigatórios
    if (!productData.nome) {
      return NextResponse.json(handleBlingApiError(new Error("Nome do produto é obrigatório"), "CREATE_PRODUCT"), {
        status: 400,
      })
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/produtos`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      body: JSON.stringify(productData),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("POST", "/produtos", response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro ao criar produto:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "CREATE_PRODUCT"),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produto criado: ID ${data.data?.id}`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId), { status: 201 })
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em POST products:`, error)

    return NextResponse.json(handleBlingApiError(error, "CREATE_PRODUCT"), { status: 500 })
  }
}
