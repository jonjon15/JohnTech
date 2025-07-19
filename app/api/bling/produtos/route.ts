import { type NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError, logBlingApiCall } from "@/lib/bling-error-handler"

const BLING_API_BASE = "https://www.bling.com.br/Api/v3"
const USER_EMAIL = "admin@johntech.com" // E-mail fixo para esta integração

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const url = new URL(`${BLING_API_BASE}/produtos`)
  url.search = request.nextUrl.search // Repassa todos os query params

  try {
    const accessToken = await getValidAccessToken(USER_EMAIL)
    if (!accessToken) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    logBlingApiCall("GET", url.pathname, response.status, Date.now() - startTime)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error("Falha ao buscar produtos", { cause: { status: response.status, body: errorData } })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const blingError = handleBlingApiError(error, "get-produtos")
    return NextResponse.json({ error: blingError }, { status: blingError.statusCode })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const url = `${BLING_API_BASE}/produtos`

  try {
    const accessToken = await getValidAccessToken(USER_EMAIL)
    if (!accessToken) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    logBlingApiCall("POST", "/produtos", response.status, Date.now() - startTime)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error("Falha ao criar produto", { cause: { status: response.status, body: errorData } })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const blingError = handleBlingApiError(error, "create-produto")
    return NextResponse.json({ error: blingError }, { status: blingError.statusCode })
  }
}
