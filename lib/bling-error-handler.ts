export interface BlingApiError {
  error: string
  message: string
  details?: any
  timestamp: string
  requestId?: string
  operation: string
}

export interface BlingApiResponse {
  success: boolean
  data?: any
  error?: BlingApiError
  meta?: {
    requestId: string
    elapsedTime: number
    timestamp: string
  }
}

export function createBlingApiResponse(data: any, elapsedTime?: number, requestId?: string): BlingApiResponse {
  return {
    success: true,
    data,
    meta: {
      requestId: requestId || crypto.randomUUID(),
      elapsedTime: elapsedTime || 0,
      timestamp: new Date().toISOString(),
    },
  }
}

export function handleBlingApiError(error: any, operation: string, requestId?: string): BlingApiError {
  console.error(`❌ Bling API Error (${operation}):`, error)

  let message = "Erro interno do servidor"
  let details = null

  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        message = "Requisição inválida"
        break
      case 401:
        message = "Token de acesso inválido ou expirado"
        break
      case 403:
        message = "Acesso negado"
        break
      case 404:
        message = "Recurso não encontrado"
        break
      case 429:
        message = "Muitas requisições - limite excedido"
        break
      case 500:
        message = "Erro interno do servidor Bling"
        break
      default:
        message = `Erro HTTP ${error.response.status}`
    }
    details = error.response.data
  } else if (error?.message) {
    message = error.message
  }

  return {
    error: operation,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: requestId || crypto.randomUUID(),
    operation,
  }
}

export function logBlingApiCall(
  method: string,
  endpoint: string,
  status: number,
  elapsedTime: number,
  requestId: string,
) {
  const statusEmoji = status >= 200 && status < 300 ? "✅" : "❌"
  console.log(`${statusEmoji} [${requestId}] ${method} ${endpoint} - ${status} (${elapsedTime}ms)`)
}
