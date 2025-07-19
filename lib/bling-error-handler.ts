export interface BlingError {
  code: string
  message: string
  details?: any
  status?: number
}

export interface BlingApiResponse<T = any> {
  success: boolean
  data?: T
  error?: BlingError
  meta?: {
    elapsed_time: number
    timestamp: string
    request_id?: string
  }
}

export class BlingApiError extends Error {
  public code: string
  public status: number
  public details?: any

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500, details?: any) {
    super(message)
    this.name = "BlingApiError"
    this.code = code
    this.status = status
    this.details = details
  }
}

export function handleBlingApiError(error: any, context = "API_CALL"): BlingApiResponse {
  console.error(`❌ Erro no contexto ${context}:`, error)

  // Timeout errors
  if (error.name === "AbortError") {
    return {
      success: false,
      error: {
        code: "TIMEOUT_ERROR",
        message: "Operação cancelada por timeout",
        status: 408,
        details: { context, timeout: true },
      },
    }
  }

  // Network errors
  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Erro de conexão com a API do Bling",
        status: 503,
        details: { context, network_error: true },
      },
    }
  }

  // Bling API specific errors
  if (error instanceof BlingApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
        details: error.details,
      },
    }
  }

  // HTTP errors with response
  if (error.response) {
    const status = error.response.status
    let code = "HTTP_ERROR"
    let message = `Erro HTTP ${status}`

    switch (status) {
      case 400:
        code = "BAD_REQUEST"
        message = "Requisição inválida"
        break
      case 401:
        code = "UNAUTHORIZED"
        message = "Token de acesso inválido ou expirado"
        break
      case 403:
        code = "FORBIDDEN"
        message = "Acesso negado"
        break
      case 404:
        code = "NOT_FOUND"
        message = "Recurso não encontrado"
        break
      case 422:
        code = "VALIDATION_ERROR"
        message = "Dados de entrada inválidos"
        break
      case 429:
        code = "RATE_LIMIT"
        message = "Limite de requisições excedido"
        break
      case 500:
        code = "SERVER_ERROR"
        message = "Erro interno do servidor Bling"
        break
    }

    return {
      success: false,
      error: {
        code,
        message,
        status,
        details: {
          context,
          response_data: error.response.data,
          headers: error.response.headers,
        },
      },
    }
  }

  // Generic errors
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: error.message || "Erro interno não identificado",
      status: 500,
      details: {
        context,
        error_type: error.constructor.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    },
  }
}

export function createBlingApiResponse<T>(data: T, elapsedTime: number, requestId?: string): BlingApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      elapsed_time: elapsedTime,
      timestamp: new Date().toISOString(),
      request_id: requestId,
    },
  }
}

export function validateBlingResponse(response: any, expectedFields: string[] = []): boolean {
  if (!response) {
    throw new BlingApiError("Resposta vazia da API Bling", "EMPTY_RESPONSE", 502)
  }

  // Verificar se é um erro do Bling
  if (response.error) {
    throw new BlingApiError(
      response.error.message || "Erro retornado pela API Bling",
      response.error.code || "BLING_API_ERROR",
      response.error.status || 400,
      response.error,
    )
  }

  // Verificar campos obrigatórios
  for (const field of expectedFields) {
    if (!(field in response)) {
      throw new BlingApiError(`Campo obrigatório '${field}' não encontrado na resposta`, "MISSING_FIELD", 502, {
        missing_field: field,
        response,
      })
    }
  }

  return true
}

export function logBlingApiCall(method: string, url: string, status: number, elapsedTime: number, requestId?: string) {
  const logLevel = status >= 400 ? "error" : status >= 300 ? "warn" : "info"
  const emoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅"

  console.log(`${emoji} Bling API ${method} ${url} - ${status} (${elapsedTime}ms)${requestId ? ` [${requestId}]` : ""}`)
}
