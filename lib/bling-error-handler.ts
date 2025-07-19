export interface BlingApiError {
  message: string
  code?: string
  status?: number
  details?: any
  timestamp: string
  request_id?: string
}

export interface BlingApiResponse {
  success: boolean
  data?: any
  error?: BlingApiError
  meta?: {
    total?: number
    page?: number
    limit?: number
    elapsed_time?: number
    request_id?: string
  }
}

export function createBlingApiResponse(data: any, elapsedTime?: number, requestId?: string): BlingApiResponse {
  return {
    success: true,
    data,
    meta: {
      elapsed_time: elapsedTime,
      request_id: requestId,
      timestamp: new Date().toISOString(),
    },
  }
}

export function handleBlingApiError(error: any, context = "UNKNOWN"): BlingApiResponse {
  console.error(`❌ Bling API Error (${context}):`, error)

  let message = "Erro interno do servidor"
  let code = "INTERNAL_ERROR"
  let status = 500

  if (error?.response?.status) {
    status = error.response.status

    switch (status) {
      case 400:
        message = "Requisição inválida"
        code = "BAD_REQUEST"
        break
      case 401:
        message = "Token de acesso inválido ou expirado"
        code = "UNAUTHORIZED"
        break
      case 403:
        message = "Acesso negado"
        code = "FORBIDDEN"
        break
      case 404:
        message = "Recurso não encontrado"
        code = "NOT_FOUND"
        break
      case 429:
        message = "Muitas requisições - limite excedido"
        code = "TOO_MANY_REQUESTS"
        break
      case 500:
        message = "Erro interno do servidor Bling"
        code = "SERVER_ERROR"
        break
    }
  }

  if (error?.message) {
    message = error.message
  }

  return {
    success: false,
    error: {
      message,
      code,
      status,
      details: error?.response?.data || error?.details,
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
    },
  }
}

export function logBlingApiCall(
  method: string,
  endpoint: string,
  status: number,
  elapsedTime: number,
  requestId?: string,
): void {
  const logLevel = status >= 400 ? "ERROR" : "INFO"
  const emoji = status >= 400 ? "❌" : "✅"

  console.log(`${emoji} [${requestId}] ${method} ${endpoint} - ${status} (${elapsedTime}ms)`)
}
