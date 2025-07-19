import { type NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

const USER_EMAIL = "admin@johntech.com"
const BLING_API_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

// GET - Listar produtos para homologação
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] GET /homologacao/produtos - INÍCIO`)

    const token = await getValidAccessToken(USER_EMAIL)
    if (!token) {
      return NextResponse.json(
        handleBlingApiError(new Error("Token não encontrado"), "GET_HOMOLOGACAO_PRODUTOS", requestId),
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const limite = searchParams.get("limite") || "50"
    const pagina = searchParams.get("pagina") || "1"

    const url = `${BLING_API_URL}/produtos?limite=${limite}&pagina=${pagina}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-bling-homologacao": "true",
      },
    })

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("GET", "/produtos", response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        handleBlingApiError(
          { response: { status: response.status, data: errorText } },
          "GET_HOMOLOGACAO_PRODUTOS",
          requestId,
        ),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] ${data.data?.length || 0} produtos obtidos`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro:`, error)
    return NextResponse.json(handleBlingApiError(error, "GET_HOMOLOGACAO_PRODUTOS", requestId), { status: 500 })
  }
}

// POST - Criar produto para homologação
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] POST /homologacao/produtos - INÍCIO`)

    const token = await getValidAccessToken(USER_EMAIL)
    if (!token) {
      return NextResponse.json(
        handleBlingApiError(new Error("Token não encontrado"), "POST_HOMOLOGACAO_PRODUTOS", requestId),
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log(`📦 [${requestId}] Dados do produto:`, body)

    const url = `${BLING_API_URL}/produtos`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-bling-homologacao": "true",
      },
      body: JSON.stringify(body),
    })

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("POST", "/produtos", response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        handleBlingApiError(
          { response: { status: response.status, data: errorText } },
          "POST_HOMOLOGACAO_PRODUTOS",
          requestId,
        ),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produto criado:`, data.data?.id)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro:`, error)
    return NextResponse.json(handleBlingApiError(error, "POST_HOMOLOGACAO_PRODUTOS", requestId), { status: 500 })
  }
}
