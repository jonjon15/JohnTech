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

/**
 * Converts any error into a predictable JSON shape.
 */
export function handleBlingApiError(error: unknown, context = "API_CALL", code = "INTERNAL_ERROR"): BlingApiResponse {
  console.error(`❌ Erro no contexto ${context}:`, error)

  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Erro inesperado"

  // Timeout errors
  if (error instanceof Error && error.name === "AbortError") {
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
  if (error instanceof Error && (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED")) {
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
  if (error instanceof Error && error.response) {
    const status = error.response.status
    let errorCode = "HTTP_ERROR"
    let errorMessage = `Erro HTTP ${status}`

    switch (status) {
      case 400:
        errorCode = "BAD_REQUEST"
        errorMessage = "Requisição inválida"
        break
      case 401:
        errorCode = "UNAUTHORIZED"
        errorMessage = "Token de acesso inválido ou expirado"
        break
      case 403:
        errorCode = "FORBIDDEN"
        errorMessage = "Acesso negado"
        break
      case 404:
        errorCode = "NOT_FOUND"
        errorMessage = "Recurso não encontrado"
        break
      case 422:
        errorCode = "VALIDATION_ERROR"
        errorMessage = "Dados de entrada inválidos"
        break
      case 429:
        errorCode = "RATE_LIMIT"
        errorMessage = "Limite de requisições excedido"
        break
      case 500:
        errorCode = "SERVER_ERROR"
        errorMessage = "Erro interno do servidor Bling"
        break
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
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
      code,
      message,
      details: {
        context,
        error_type: error.constructor ? error.constructor.name : undefined,
        stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
      },
    },
  }
}

/**
 * Small helper to create a standard API response body.
 */
export function createBlingApiResponse<T>(payload: T, elapsedMs: number, requestId: string): BlingApiResponse<T> {
  return {
    success: true,
    data: payload,
    meta: {
      elapsed_time: elapsedMs,
      timestamp: new Date().toISOString(),
      request_id: requestId,
    },
  }
}

/**
 * Simple console logger for observability.
 */
export function logBlingApiCall(method: string, path: string, requestId: string, elapsedMs: number, success: boolean) {
  const emoji = success ? "✅" : "❌"
  // eslint-disable-next-line no-console
  console.log(`${emoji} [${requestId}] ${method} ${path} - ${elapsedMs} ms`)
}
