import { type NextRequest, NextResponse } from "next/server"
import { createBlingApiResponse, handleBlingApiError, logBlingApiCall } from "@/lib/bling-error-handler"
import { getValidAccessToken } from "@/lib/bling-auth"
import crypto from "crypto"

const USER_EMAIL = "admin@johntech.com"
const BLING_API_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] GET /homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(USER_EMAIL)
    if (!token) {
      return NextResponse.json(
        handleBlingApiError(new Error("Token não encontrado"), "GET_HOMOLOGACAO_PRODUTO", requestId),
        { status: 401 },
      )
    }

    const url = `${BLING_API_URL}/produtos/${params.id}`

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
    logBlingApiCall("GET", `/produtos/${params.id}`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        handleBlingApiError(
          { response: { status: response.status, data: errorText } },
          "GET_HOMOLOGACAO_PRODUTO",
          requestId,
        ),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produto obtido:`, params.id)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro:`, error)
    return NextResponse.json(handleBlingApiError(error, "GET_HOMOLOGACAO_PRODUTO", requestId), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] PUT /homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(USER_EMAIL)
    if (!token) {
      return NextResponse.json(
        handleBlingApiError(new Error("Token não encontrado"), "PUT_HOMOLOGACAO_PRODUTO", requestId),
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log(`📦 [${requestId}] Atualizando produto:`, params.id)

    const url = `${BLING_API_URL}/produtos/${params.id}`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-bling-homologacao": "true",
      },
      body: JSON.stringify(body),
    })

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("PUT", `/produtos/${params.id}`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        handleBlingApiError(
          { response: { status: response.status, data: errorText } },
          "PUT_HOMOLOGACAO_PRODUTO",
          requestId,
        ),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produto atualizado:`, params.id)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro:`, error)
    return NextResponse.json(handleBlingApiError(error, "PUT_HOMOLOGACAO_PRODUTO", requestId), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] DELETE /homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(USER_EMAIL)
    if (!token) {
      return NextResponse.json(
        handleBlingApiError(new Error("Token não encontrado"), "DELETE_HOMOLOGACAO_PRODUTO", requestId),
        { status: 401 },
      )
    }

    const url = `${BLING_API_URL}/produtos/${params.id}`

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-bling-homologacao": "true",
      },
    })

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("DELETE", `/produtos/${params.id}`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        handleBlingApiError(
          { response: { status: response.status, data: errorText } },
          "DELETE_HOMOLOGACAO_PRODUTO",
          requestId,
        ),
        { status: response.status },
      )
    }

    console.log(`✅ [${requestId}] Produto excluído:`, params.id)

    return NextResponse.json(createBlingApiResponse({ deleted: true }, elapsedTime, requestId))
  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro:`, error)
    return NextResponse.json(handleBlingApiError(error, "DELETE_HOMOLOGACAO_PRODUTO", requestId), { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] PATCH /homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(USER_EMAIL)
    if (!token) {
      return NextResponse.json(
        handleBlingApiError(new Error("Token não encontrado"), "PATCH_HOMOLOGACAO_PRODUTO", requestId),
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log(`📦 [${requestId}] Alterando situação:`, params.id, body)

    const url = `${BLING_API_URL}/produtos/${params.id}/situacoes`

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-bling-homologacao": "true",
      },
      body: JSON.stringify(body),
    })

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("PATCH", `/produtos/${params.id}/situacoes`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        handleBlingApiError(
          { response: { status: response.status, data: errorText } },
          "PATCH_HOMOLOGACAO_PRODUTO",
          requestId,
        ),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Situação alterada:`, params.id)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro:`, error)
    return NextResponse.json(handleBlingApiError(error, "PATCH_HOMOLOGACAO_PRODUTO", requestId), { status: 500 })
  }
}
