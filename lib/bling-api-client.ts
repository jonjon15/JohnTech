import { getValidAccessToken } from "@/lib/bling-auth"
import { createBlingApiResponse, handleBlingApiError, logBlingApiCall } from "@/lib/bling-error-handler"
import type { BlingApiResponse } from "@/types/bling"

const BLING_API_BASE_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

/**
 * Função genérica para fazer requisições à API do Bling
 * Inclui tratamento de autenticação, refresh automático de tokens e tratamento de erros
 */
export async function makeRequest<T>(
  userEmail: string,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  retryCount = 0,
): Promise<BlingApiResponse<T>> {
  const url = `${BLING_API_BASE_URL}${endpoint}`
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    console.log(`➡️ [${requestId}] Bling API Request: ${method} ${url}`)

    const accessToken = await getValidAccessToken(userEmail)
    if (!accessToken) {
      console.error(`❌ [${requestId}] Token de acesso não disponível para ${userEmail}`)
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
      "User-Agent": "JohnTech-BlingIntegration/1.0",
    }

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    const response = await fetch(url, config)
    const responseData = await response.json().catch(() => null)

    const elapsedTime = Date.now() - startTime
    logBlingApiCall(requestId, method, url, response.status, responseData, elapsedTime)

    // Se recebeu 401 e ainda não tentou retry, tenta refresh do token
    if (response.status === 401 && retryCount === 0) {
      console.log(`🔄 [${requestId}] Token expirado, tentando refresh...`)
      const newToken = await getValidAccessToken(userEmail, true) // Force refresh
      if (newToken) {
        return makeRequest(userEmail, endpoint, method, body, retryCount + 1)
      }
    }

    if (!response.ok) {
      console.error(`❌ [${requestId}] Bling API Error Response (${response.status}):`, responseData)
      const errorDetails = handleBlingApiError(
        responseData || { statusCode: response.status, message: response.statusText },
      )
      return createBlingApiResponse(false, null, errorDetails)
    }

    console.log(`✅ [${requestId}] Bling API Success (${response.status})`)
    return createBlingApiResponse(true, responseData as T, null)
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Bling API Request Failed:`, error)
    logBlingApiCall(requestId, method, url, 500, { message: error.message || "Unknown error" }, elapsedTime)
    const errorDetails = handleBlingApiError(error)
    return createBlingApiResponse(false, null, errorDetails)
  }
}

/**
 * Cliente simplificado para a API Bling
 */
export async function getBlingApiClient(userEmail: string) {
  return {
    get: (endpoint: string) => makeRequest(userEmail, endpoint, "GET"),
    post: (endpoint: string, body: any) => makeRequest(userEmail, endpoint, "POST", body),
    put: (endpoint: string, body: any) => makeRequest(userEmail, endpoint, "PUT", body),
    delete: (endpoint: string) => makeRequest(userEmail, endpoint, "DELETE"),
  }
}

/**
 * Funções específicas para endpoints do Bling
 */
export class BlingApiService {
  userEmail: string

  constructor(userEmail: string) {
    this.userEmail = userEmail
  }

  // Produtos
  async getProdutos(page = 1, limit = 100) {
    return makeRequest(this.userEmail, `/produtos?pagina=${page}&limite=${limit}`, "GET")
  }

  async getProduto(id: number) {
    return makeRequest(this.userEmail, `/produtos/${id}`, "GET")
  }

  async createProduto(produto: any) {
    return makeRequest(this.userEmail, "/produtos", "POST", produto)
  }

  async updateProduto(id: number, produto: any) {
    return makeRequest(this.userEmail, `/produtos/${id}`, "PUT", produto)
  }

  // Pedidos
  async getPedidos(page = 1, limit = 100) {
    return makeRequest(this.userEmail, `/pedidos?pagina=${page}&limite=${limit}`, "GET")
  }

  async getPedido(id: number) {
    return makeRequest(this.userEmail, `/pedidos/${id}`, "GET")
  }

  async createPedido(pedido: any) {
    return makeRequest(this.userEmail, "/pedidos", "POST", pedido)
  }

  // Estoque
  async getEstoque(page = 1, limit = 100) {
    return makeRequest(this.userEmail, `/estoques?pagina=${page}&limite=${limit}`, "GET")
  }

  async updateEstoque(produtoId: number, estoque: any) {
    return makeRequest(this.userEmail, `/estoques/${produtoId}`, "PUT", estoque)
  }

  // Contatos
  async getContatos(page = 1, limit = 100) {
    return makeRequest(this.userEmail, `/contatos?pagina=${page}&limite=${limit}`, "GET")
  }

  async getContato(id: number) {
    return makeRequest(this.userEmail, `/contatos/${id}`, "GET")
  }

  async createContato(contato: any) {
    return makeRequest(this.userEmail, "/contatos", "POST", contato)
  }

  // Categorias
  async getCategorias() {
    return makeRequest(this.userEmail, "/categorias", "GET")
  }

  // Situações
  async getSituacoes() {
    return makeRequest(this.userEmail, "/situacoes", "GET")
  }
}
