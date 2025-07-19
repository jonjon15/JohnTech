import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import {
  handleBlingApiError,
  createBlingApiResponse,
  logBlingApiCall,
} from "@/lib/bling-error-handler"

const userEmail = "admin@johntech.com"
const REQUEST_TIMEOUT = 8000

const buildBlingUrl = (path: string) =>
  `${process.env.BLING_API_URL || "https://api.bling.com.br"}${path.startsWith("/") ? "" : "/"}${path}`

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔍 [${requestId}] GET /api/bling/homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "GET_HOMOLOG_PRODUCT"), {
        status: 401,
      })
    }

    const url = buildBlingUrl(`/homologacao/produtos/${params.id}`)

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
    logBlingApiCall("GET", `/homologacao/produtos/${params.id}`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro ao buscar produto:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "GET_HOMOLOG_PRODUCT"),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produto obtido: ${data.data?.nome}`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em GET produto homologação:`, error)

    return NextResponse.json(handleBlingApiError(error, "GET_HOMOLOG_PRODUCT"), { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`✏️ [${requestId}] PUT /api/bling/homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "UPDATE_HOMOLOG_PRODUCT"), {
        status: 401,
      })
    }

    const productData = await request.json()
    if (!productData || typeof productData !== "object") {
      return NextResponse.json(
        handleBlingApiError(new Error("Payload inválido"), "UPDATE_HOMOLOG_PRODUCT"),
        { status: 400 },
      )
    }

    console.log(`📝 [${requestId}] Dados para atualização:`, JSON.stringify(productData, null, 2))

    const url = buildBlingUrl(`/homologacao/produtos/${params.id}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
      method: "PUT",
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
    logBlingApiCall("PUT", `/homologacao/produtos/${params.id}`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro ao atualizar produto:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "UPDATE_HOMOLOG_PRODUCT"),
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Produto atualizado: ${params.id}`)

    return NextResponse.json(createBlingApiResponse(data, elapsedTime, requestId))
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em PUT produto homologação:`, error)

    return NextResponse.json(handleBlingApiError(error, "UPDATE_HOMOLOG_PRODUCT"), { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🗑️ [${requestId}] DELETE /api/bling/homologacao/produtos/${params.id} - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "DELETE_HOMOLOG_PRODUCT"), {
        status: 401,
      })
    }

    const url = buildBlingUrl(`/homologacao/produtos/${params.id}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const elapsedTime = Date.now() - startTime
    logBlingApiCall("DELETE", `/homologacao/produtos/${params.id}`, response.status, elapsedTime, requestId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [${requestId}] Erro ao excluir produto:`, errorText)

      return NextResponse.json(
        handleBlingApiError({ response: { status: response.status, data: errorText } }, "DELETE_HOMOLOG_PRODUCT"),
        { status: response.status },
      )
    }

    console.log(`✅ [${requestId}] Produto excluído: ${params.id}`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          message: "Produto excluído com sucesso",
          product_id: params.id,
          deleted_at: new Date().toISOString(),
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro em DELETE produto homologação:`, error)

    return NextResponse.json(handleBlingApiError(error, "DELETE_HOMOLOG_PRODUCT"), { status: 500 })
  }
}
