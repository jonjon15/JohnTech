import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

const userEmail = "admin@johntech.com"
const REQUEST_TIMEOUT = 10000

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] POST /api/bling/sync - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "SYNC_PRODUCTS"), { status: 401 })
    }

    const body = await request.json()
    console.log(`📦 [${requestId}] Dados para sincronização:`, body)

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
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("POST", "/produtos", response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro na sincronização:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "SYNC_PRODUCTS"),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Sincronização concluída`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro na sincronização:`, error)

    return NextResponse.json(handleBlingApiError(error, "SYNC_PRODUCTS"), { status: 500 })
  }
}
