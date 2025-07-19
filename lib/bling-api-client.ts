import { getValidAccessToken } from "@/lib/bling-auth"
import { createBlingApiResponse, handleBlingApiError, logBlingApiCall } from "@/lib/bling-error-handler"
import type { BlingApiResponse } from "@/types/bling"

const BLING_API_BASE_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

/**
 * Função genérica para fazer requisições à API do Bling.
 * Inclui tratamento de autenticação e erros.
 * @param userEmail O email do usuário para obter o token.
 * @param endpoint O endpoint da API (ex: "/produtos").
 * @param method O método HTTP (GET, POST, PUT, DELETE).
 * @param body O corpo da requisição (para POST, PUT).
 * @returns Uma resposta padronizada da API Bling.
 */
export async function makeRequest<T>(
  userEmail: string,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
): Promise<BlingApiResponse<T>> {
  const url = `${BLING_API_BASE_URL}${endpoint}`
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    console.log(`➡️ [${requestId}] Bling API Request: ${method} ${url}`)

    const accessToken = await getValidAccessToken(userEmail)
    if (!accessToken) {
      console.error(`❌ [${requestId}] Bling API: Token de acesso não disponível para ${userEmail}.`)
      return createBlingApiResponse(
        false,
        null,
        handleBlingApiError({
          code: "40101",
          message: "Token de acesso Bling inválido ou não encontrado. Por favor, reautentique.",
          statusCode: 401,
        }),
      )
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    }

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    const response = await fetch(url, config)
    const responseData = await response.json().catch(() => null) // Tenta parsear JSON, se falhar, retorna null

    const elapsedTime = Date.now() - startTime
    logBlingApiCall(requestId, method, url, response.status, responseData, elapsedTime)

    if (!response.ok) {
      console.error(`❌ [${requestId}] Bling API Error Response (${response.status}):`, responseData)
      const errorDetails = handleBlingApiError(
        responseData || { statusCode: response.status, message: response.statusText },
      )
      return createBlingApiResponse(false, null, errorDetails)
    }

    console.log(`✅ [${requestId}] Bling API Success (${response.status}):`, responseData)
    return createBlingApiResponse(true, responseData as T, null)
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Bling API Request Failed:`, error)
    logBlingApiCall(requestId, method, url, 500, { message: error.message || "Unknown error" }, elapsedTime)
    const errorDetails = handleBlingApiError(error)
    return createBlingApiResponse(false, null, errorDetails)
  }
}

export const getBlingApiClient = makeRequest
