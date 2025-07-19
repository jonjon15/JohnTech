// Tipos para integração com a API do Bling

export interface BlingTokenData {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope?: string
}

export interface StoredToken {
  id: number
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface BlingProduct {
  id: string
  nome: string
  codigo?: string
  preco?: number
  descricao?: string
  situacao?: string
  tipo?: string
  formato?: string
  unidade?: string
  peso_bruto?: number
  peso_liquido?: number
  gtin?: string
  marca?: string
  categoria?: string
  estoque?: {
    minimo?: number
    maximo?: number
    atual?: number
  }
}

export interface BlingApiResponse<T = any> {
  data: T[]
  pagina?: number
  limite?: number
  total?: number
}

export interface BlingError {
  error: {
    type: string
    message: string
    description?: string
  }
}

export interface BlingAuthToken {
  access_token: string
  refresh_token: string
  expires_at: string
}

export interface WebhookPayload {
  topic: string
  resource: {
    id: string
    type: string
  }
  data: any
  timestamp: string
}
