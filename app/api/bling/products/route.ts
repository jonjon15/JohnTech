import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

const userEmail = "admin@johntech.com"
const REQUEST_TIMEOUT = 8000

export async function GET() {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] GET /api/bling/products - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "GET_PRODUCTS"), { status: 401 })
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/produtos?limite=50`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
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
    logBlingApiCall("GET", "/produtos", response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro ao buscar produtos:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "GET_PRODUCTS"),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] ${data.data?.length || 0} produtos obtidos`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em GET produtos:`, error)

    return NextResponse.json(handleBlingApiError(error, "GET_PRODUCTS"), { status: 500 })
  }
}
