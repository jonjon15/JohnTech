import { getValidAccessToken } from "./bling-auth"
import { handleBlingError, logRequest } from "./bling-error-handler"

const BLING_API_BASE_URL = "https://www.bling.com.br/Api/v3"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export interface BlingApiClient {
  request: <T = unknown>(method: HttpMethod, endpoint: string, body?: unknown) => Promise<T>
}

/**
 * Retorna um cliente simplificado para a API Bling já com token válido.
 * Caso o token esteja expirado, getValidAccessToken faz o refresh
 */
export async function getBlingApiClient(userEmail: string): Promise<BlingApiClient> {
  const accessToken = await getValidAccessToken(userEmail)

  async function request<T>(method: HttpMethod, endpoint: string, body?: unknown): Promise<T> {
    const requestId = crypto.randomUUID()
    const url = `${BLING_API_BASE_URL}${endpoint}`

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = res.ok ? await res.json() : await res.json().catch(() => ({}))

    logRequest(requestId, { method, url, status: res.status, data })

    if (!res.ok) {
      throw handleBlingError({ ...data, statusCode: res.status })
    }
    return data as T
  }

  return { request }
}
