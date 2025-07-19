/**
 * Cliente oficial da API Bling v3
 * Baseado na documentação: https://developer.bling.com.br
 */

export interface BlingApiConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface BlingApiResponse<T = any> {
  data: T
  errors?: BlingError[]
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface BlingError {
  code: string
  message: string
  field?: string
}

export type BlingProduct = {}

export type CreateProductRequest = {}

export type UpdateProductRequest = {}

export type BlingCategory = {}

export type BlingStock = {}

export type StockUpdate = {}

export type BlingOrder = {}

export type CreateOrderRequest = {}

export type BlingContact = {}

export class BlingApiClient {
  private config: BlingApiConfig
  private accessToken?: string

  constructor(config: BlingApiConfig) {
    this.config = config
  }

  // Produtos
  async getProducts(params?: {
    page?: number
    limit?: number
    criterio?: 1 | 2 | 3 // 1=ID, 2=Código, 3=Descrição
    tipo?: "P" | "S" // P=Produto, S=Serviço
    situacao?: "A" | "I" // A=Ativo, I=Inativo
    codigo?: string
    nome?: string
    idCategoria?: number
  }): Promise<BlingApiResponse<BlingProduct[]>> {
    return this.request("GET", "/produtos", { params })
  }

  async createProduct(product: CreateProductRequest): Promise<BlingApiResponse<BlingProduct>> {
    return this.request("POST", "/produtos", { body: product })
  }

  async updateProduct(id: number, product: UpdateProductRequest): Promise<BlingApiResponse<BlingProduct>> {
    return this.request("PUT", `/produtos/${id}`, { body: product })
  }

  async deleteProduct(id: number): Promise<BlingApiResponse<void>> {
    return this.request("DELETE", `/produtos/${id}`)
  }

  // Categorias
  async getCategories(): Promise<BlingApiResponse<BlingCategory[]>> {
    return this.request("GET", "/categorias")
  }

  // Estoque
  async getStock(params?: {
    idsProdutos?: number[]
    idsDepositos?: number[]
  }): Promise<BlingApiResponse<BlingStock[]>> {
    return this.request("GET", "/estoques", { params })
  }

  async updateStock(updates: StockUpdate[]): Promise<BlingApiResponse<void>> {
    return this.request("PUT", "/estoques", { body: { estoques: updates } })
  }

  // Pedidos
  async getOrders(params?: {
    page?: number
    limit?: number
    dataInicial?: string
    dataFinal?: string
    situacao?: number
  }): Promise<BlingApiResponse<BlingOrder[]>> {
    return this.request("GET", "/pedidos/vendas", { params })
  }

  async createOrder(order: CreateOrderRequest): Promise<BlingApiResponse<BlingOrder>> {
    return this.request("POST", "/pedidos/vendas", { body: order })
  }

  // Contatos
  async getContacts(params?: {
    page?: number
    limit?: number
    tipo?: "C" | "F" | "T" // C=Cliente, F=Fornecedor, T=Transportadora
  }): Promise<BlingApiResponse<BlingContact[]>> {
    return this.request("GET", "/contatos", { params })
  }

  // Método base para requisições
  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      params?: Record<string, any>
      body?: any
      headers?: Record<string, string>
    },
  ): Promise<BlingApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseUrl)

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options?.headers,
    }

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Bling API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }
}
