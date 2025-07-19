import { getTokens } from "@/lib/db"
import type { BlingProduct, CreateProductRequest, UpdateProductRequest } from "@/types/bling"
import type { BlingErrorResponse } from "@/lib/bling-error-handler"

const BLING_API_BASE_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
const USER_EMAIL = process.env.BLING_USER_EMAIL || "default_user@example.com" // Usar um email padrão ou de configuração

interface BlingApiResponse<T> {
  data?: T
  error?: BlingErrorResponse
}

// Função para obter um cliente Bling API com token de acesso válido
export async function getBlingApiClient() {
  const tokens = await getTokens(USER_EMAIL)

  if (!tokens || new Date() > new Date(tokens.expires_at)) {
    // Aqui você precisaria de uma lógica para refrescar o token
    // Por simplicidade, vamos lançar um erro ou redirecionar para reautenticação
    throw new Error("Token Bling expirado ou não encontrado. Por favor, reautentique.")
  }

  const accessToken = tokens.access_token

  const makeRequest = async (method: string, path: string, body?: any): Promise<BlingApiResponse<any>> => {
    const url = `${BLING_API_BASE_URL}${path}`
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Bling API retorna erros no formato { error: { code, message } }
        return {
          error: {
            code: responseData.error?.code || response.status.toString(),
            message: responseData.error?.message || response.statusText,
            statusCode: response.status,
            details: responseData.error?.details || responseData,
          },
        }
      }

      return { data: responseData }
    } catch (error: any) {
      console.error(`Erro na requisição Bling API (${method} ${path}):`, error)
      return {
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Erro de rede ou comunicação com a API Bling",
          statusCode: 500,
          details: error,
        },
      }
    }
  }

  return {
    products: {
      get: async (id: number): Promise<BlingApiResponse<BlingProduct>> => makeRequest(`GET`, `/produtos/${id}`),
      list: async (): Promise<BlingApiResponse<{ produtos: BlingProduct[] }>> => makeRequest(`GET`, `/produtos`),
      create: async (product: CreateProductRequest): Promise<BlingApiResponse<BlingProduct>> =>
        makeRequest(`POST`, `/produtos`, product),
      update: async (id: number, product: UpdateProductRequest): Promise<BlingApiResponse<BlingProduct>> =>
        makeRequest(`PUT`, `/produtos/${id}`, product),
      delete: async (id: number): Promise<BlingApiResponse<any>> => makeRequest(`DELETE`, `/produtos/${id}`),
    },
    // Adicione outros recursos da API Bling aqui (pedidos, contatos, etc.)
  }
}
