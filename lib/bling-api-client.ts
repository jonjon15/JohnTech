import { BlingAuth } from "./bling-auth"
import type {
  BlingProduct,
  BlingProductsResponse,
  BlingOrder,
  BlingOrdersResponse,
  BlingContact,
  BlingContactsResponse,
  BlingStock,
  BlingStockResponse,
  BlingSearchFilters,
  BlingApiResponse,
  BlingApiError,
  BlingRateLimit,
} from "@/types/bling"

/**
 * Cliente para API do Bling v3
 * Baseado em: https://developer.bling.com.br/referencia
 */
export class BlingApiClient {
  private static readonly API_BASE_URL = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // 1 segundo

  private static rateLimit: BlingRateLimit = {
    limit: 1000,
    remaining: 1000,
    reset: Date.now() + 3600000, // 1 hora
  }

  /**
   * Faz requisição para API do Bling com retry e rate limiting
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<BlingApiResponse<T>> {
    try {
      // Verifica rate limit
      await this.checkRateLimit()

      const accessToken = await BlingAuth.getValidAccessToken()
      const url = `${this.API_BASE_URL}${endpoint}`

      console.log(`🌐 ${options.method || "GET"} ${endpoint}`)

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      })

      // Atualiza informações de rate limit
      this.updateRateLimit(response)

      const data = await response.json()

      if (!response.ok) {
        await this.handleApiError(response, data, endpoint, options, retryCount)
      }

      console.log(`✅ ${response.status} ${endpoint}`)
      return data
    } catch (error) {
      console.error(`❌ Erro na requisição ${endpoint}:`, error)

      // Retry em caso de erro de rede
      if (retryCount < this.MAX_RETRIES && this.shouldRetry(error)) {
        const delay = this.RETRY_DELAY * Math.pow(2, retryCount) // Backoff exponencial
        console.log(`🔄 Tentativa ${retryCount + 1}/${this.MAX_RETRIES} em ${delay}ms`)

        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.makeRequest(endpoint, options, retryCount + 1)
      }

      throw error
    }
  }

  /**
   * Verifica e aguarda rate limit se necessário
   */
  private static async checkRateLimit(): Promise<void> {
    if (this.rateLimit.remaining <= 0) {
      const waitTime = this.rateLimit.reset - Date.now()
      if (waitTime > 0) {
        console.log(`⏳ Rate limit atingido. Aguardando ${Math.ceil(waitTime / 1000)}s...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  /**
   * Atualiza informações de rate limit baseado na resposta
   */
  private static updateRateLimit(response: Response): void {
    const limit = response.headers.get("X-RateLimit-Limit")
    const remaining = response.headers.get("X-RateLimit-Remaining")
    const reset = response.headers.get("X-RateLimit-Reset")

    if (limit) this.rateLimit.limit = Number.parseInt(limit)
    if (remaining) this.rateLimit.remaining = Number.parseInt(remaining)
    if (reset) this.rateLimit.reset = Number.parseInt(reset) * 1000
  }

  /**
   * Trata erros da API
   */
  private static async handleApiError(
    response: Response,
    data: any,
    endpoint: string,
    options: RequestInit,
    retryCount: number,
  ): Promise<never> {
    const status = response.status

    // Rate limit (429)
    if (status === 429) {
      const retryAfter = response.headers.get("Retry-After")
      const waitTime = retryAfter ? Number.parseInt(retryAfter) * 1000 : 60000

      if (retryCount < this.MAX_RETRIES) {
        console.log(`⏳ Rate limit (429). Aguardando ${waitTime / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        return this.makeRequest(endpoint, options, retryCount + 1)
      }
    }

    // Token expirado (401)
    if (status === 401) {
      console.log("🔄 Token expirado, tentando renovar...")
      try {
        await BlingAuth.refreshAccessToken()
        if (retryCount < this.MAX_RETRIES) {
          return this.makeRequest(endpoint, options, retryCount + 1)
        }
      } catch (refreshError) {
        console.error("❌ Erro ao renovar token:", refreshError)
        throw new Error("Token expirado e não foi possível renovar. Faça login novamente.")
      }
    }

    // Monta mensagem de erro
    let errorMessage = `Erro ${status}`
    if (data.errors && Array.isArray(data.errors)) {
      const errors = data.errors.map((err: BlingApiError) => err.error.message).join(", ")
      errorMessage += `: ${errors}`
    } else if (data.error) {
      errorMessage += `: ${data.error}`
    }

    console.error(`❌ ${errorMessage}`)
    throw new Error(errorMessage)
  }

  /**
   * Verifica se deve fazer retry baseado no erro
   */
  private static shouldRetry(error: any): boolean {
    // Retry em erros de rede
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return true
    }

    // Retry em erros 5xx
    if (error.status >= 500) {
      return true
    }

    return false
  }

  // === PRODUTOS ===

  /**
   * Lista produtos
   * https://developer.bling.com.br/referencia#/Produtos/get_produtos
   */
  static async getProducts(filters: BlingSearchFilters = {}): Promise<BlingProductsResponse> {
    const params = new URLSearchParams()

    if (filters.pagina) params.append("pagina", filters.pagina.toString())
    if (filters.limite) params.append("limite", filters.limite.toString())
    if (filters.criterio) params.append("criterio", filters.criterio)
    if (filters.tipo) params.append("tipo", filters.tipo)
    if (filters.situacao) params.append("situacao", filters.situacao)
    if (filters.codigo) params.append("codigo", filters.codigo)
    if (filters.dataInicial) params.append("dataInicial", filters.dataInicial)
    if (filters.dataFinal) params.append("dataFinal", filters.dataFinal)
    if (filters.idCategoria) params.append("idCategoria", filters.idCategoria.toString())

    const queryString = params.toString()
    const endpoint = `/produtos${queryString ? `?${queryString}` : ""}`

    const response = await this.makeRequest<BlingProduct[]>(endpoint)
    return {
      data: response.data || [],
      pagina: filters.pagina || 1,
      limite: filters.limite || 100,
      total: response.data?.length || 0,
    }
  }

  /**
   * Obtém produto por ID
   * https://developer.bling.com.br/referencia#/Produtos/get_produtos__idProduto_
   */
  static async getProduct(id: number): Promise<BlingProduct> {
    const response = await this.makeRequest<BlingProduct>(`/produtos/${id}`)
    if (!response.data) {
      throw new Error(`Produto ${id} não encontrado`)
    }
    return response.data
  }

  /**
   * Cria novo produto
   * https://developer.bling.com.br/referencia#/Produtos/post_produtos
   */
  static async createProduct(product: Partial<BlingProduct>): Promise<BlingProduct> {
    const response = await this.makeRequest<BlingProduct>("/produtos", {
      method: "POST",
      body: JSON.stringify(product),
    })

    if (!response.data) {
      throw new Error("Erro ao criar produto")
    }

    return response.data
  }

  /**
   * Atualiza produto
   * https://developer.bling.com.br/referencia#/Produtos/put_produtos__idProduto_
   */
  static async updateProduct(id: number, product: Partial<BlingProduct>): Promise<BlingProduct> {
    const response = await this.makeRequest<BlingProduct>(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })

    if (!response.data) {
      throw new Error(`Erro ao atualizar produto ${id}`)
    }

    return response.data
  }

  /**
   * Exclui produto
   * https://developer.bling.com.br/referencia#/Produtos/delete_produtos__idProduto_
   */
  static async deleteProduct(id: number): Promise<void> {
    await this.makeRequest(`/produtos/${id}`, {
      method: "DELETE",
    })
  }

  // === PEDIDOS ===

  /**
   * Lista pedidos
   * https://developer.bling.com.br/referencia#/Pedidos%20de%20Venda/get_pedidos_vendas
   */
  static async getOrders(filters: BlingSearchFilters = {}): Promise<BlingOrdersResponse> {
    const params = new URLSearchParams()

    if (filters.pagina) params.append("pagina", filters.pagina.toString())
    if (filters.limite) params.append("limite", filters.limite.toString())
    if (filters.dataInicial) params.append("dataInicial", filters.dataInicial)
    if (filters.dataFinal) params.append("dataFinal", filters.dataFinal)
    if (filters.idSituacao) params.append("idSituacao", filters.idSituacao.toString())
    if (filters.idContato) params.append("idContato", filters.idContato.toString())

    const queryString = params.toString()
    const endpoint = `/pedidos/vendas${queryString ? `?${queryString}` : ""}`

    const response = await this.makeRequest<BlingOrder[]>(endpoint)
    return {
      data: response.data || [],
      pagina: filters.pagina || 1,
      limite: filters.limite || 100,
      total: response.data?.length || 0,
    }
  }

  /**
   * Obtém pedido por ID
   * https://developer.bling.com.br/referencia#/Pedidos%20de%20Venda/get_pedidos_vendas__idPedidoVenda_
   */
  static async getOrder(id: number): Promise<BlingOrder> {
    const response = await this.makeRequest<BlingOrder>(`/pedidos/vendas/${id}`)
    if (!response.data) {
      throw new Error(`Pedido ${id} não encontrado`)
    }
    return response.data
  }

  /**
   * Cria novo pedido
   * https://developer.bling.com.br/referencia#/Pedidos%20de%20Venda/post_pedidos_vendas
   */
  static async createOrder(order: Partial<BlingOrder>): Promise<BlingOrder> {
    const response = await this.makeRequest<BlingOrder>("/pedidos/vendas", {
      method: "POST",
      body: JSON.stringify(order),
    })

    if (!response.data) {
      throw new Error("Erro ao criar pedido")
    }

    return response.data
  }

  /**
   * Atualiza pedido
   * https://developer.bling.com.br/referencia#/Pedidos%20de%20Venda/put_pedidos_vendas__idPedidoVenda_
   */
  static async updateOrder(id: number, order: Partial<BlingOrder>): Promise<BlingOrder> {
    const response = await this.makeRequest<BlingOrder>(`/pedidos/vendas/${id}`, {
      method: "PUT",
      body: JSON.stringify(order),
    })

    if (!response.data) {
      throw new Error(`Erro ao atualizar pedido ${id}`)
    }

    return response.data
  }

  // === CONTATOS ===

  /**
   * Lista contatos
   * https://developer.bling.com.br/referencia#/Contatos/get_contatos
   */
  static async getContacts(filters: BlingSearchFilters = {}): Promise<BlingContactsResponse> {
    const params = new URLSearchParams()

    if (filters.pagina) params.append("pagina", filters.pagina.toString())
    if (filters.limite) params.append("limite", filters.limite.toString())
    if (filters.criterio) params.append("criterio", filters.criterio)
    if (filters.tipo) params.append("tipo", filters.tipo)
    if (filters.situacao) params.append("situacao", filters.situacao)

    const queryString = params.toString()
    const endpoint = `/contatos${queryString ? `?${queryString}` : ""}`

    const response = await this.makeRequest<BlingContact[]>(endpoint)
    return {
      data: response.data || [],
      pagina: filters.pagina || 1,
      limite: filters.limite || 100,
      total: response.data?.length || 0,
    }
  }

  /**
   * Obtém contato por ID
   * https://developer.bling.com.br/referencia#/Contatos/get_contatos__idContato_
   */
  static async getContact(id: number): Promise<BlingContact> {
    const response = await this.makeRequest<BlingContact>(`/contatos/${id}`)
    if (!response.data) {
      throw new Error(`Contato ${id} não encontrado`)
    }
    return response.data
  }

  // === ESTOQUE ===

  /**
   * Lista estoque
   * https://developer.bling.com.br/referencia#/Estoque/get_estoques_saldos
   */
  static async getStock(filters: BlingSearchFilters = {}): Promise<BlingStockResponse> {
    const params = new URLSearchParams()

    if (filters.pagina) params.append("pagina", filters.pagina.toString())
    if (filters.limite) params.append("limite", filters.limite.toString())

    const queryString = params.toString()
    const endpoint = `/estoques/saldos${queryString ? `?${queryString}` : ""}`

    const response = await this.makeRequest<BlingStock[]>(endpoint)
    return {
      data: response.data || [],
      pagina: filters.pagina || 1,
      limite: filters.limite || 100,
      total: response.data?.length || 0,
    }
  }

  /**
   * Obtém saldo de estoque de um produto
   * https://developer.bling.com.br/referencia#/Estoque/get_estoques_saldos__idProduto_
   */
  static async getProductStock(productId: number): Promise<BlingStock[]> {
    const response = await this.makeRequest<BlingStock[]>(`/estoques/saldos/${productId}`)
    return response.data || []
  }

  // === UTILITÁRIOS ===

  /**
   * Testa conectividade com a API
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/me")
      return true
    } catch (error) {
      console.error("❌ Erro ao testar conexão:", error)
      return false
    }
  }

  /**
   * Obtém informações de rate limit
   */
  static getRateLimit(): BlingRateLimit {
    return { ...this.rateLimit }
  }

  /**
   * Obtém estatísticas da API
   */
  static async getApiStats(): Promise<{
    authenticated: boolean
    rateLimit: BlingRateLimit
    lastRequest?: Date
  }> {
    const authenticated = await BlingAuth.isAuthenticated()
    return {
      authenticated,
      rateLimit: this.getRateLimit(),
    }
  }
}
