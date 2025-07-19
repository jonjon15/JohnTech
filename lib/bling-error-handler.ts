export interface BlingApiError {
  error: string
  message: string
  details?: any
  timestamp: string
  request_id?: string
  elapsed_time?: number
}

export interface BlingApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  timestamp: string
  request_id?: string
  elapsed_time?: number
}

export function createBlingApiResponse(data: any, elapsedTime?: number, requestId?: string): BlingApiResponse {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    request_id: requestId,
    elapsed_time: elapsedTime,
  }
}

export function handleBlingApiError(error: any, operation: string): BlingApiError {
  console.error(`❌ Bling API Error (${operation}):`, error)

  let message = "Erro interno do servidor"
  let details = null

  if (error?.response) {
    // Erro HTTP da API do Bling
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 401:
        message = "Token de acesso inválido ou expirado"
        break
      case 403:
        message = "Acesso negado - verifique as permissões"
        break
      case 404:
        message = "Recurso não encontrado"
        break
      case 429:
        message = "Limite de requisições excedido"
        break
      case 500:
        message = "Erro interno do servidor Bling"
        break
      default:
        message = `Erro HTTP ${status}`
    }

    details = data
  } else if (error?.message) {
    message = error.message
  }

  return {
    error: operation,
    message,
    details,
    timestamp: new Date().toISOString(),
  }
}

export function logBlingApiCall(
  method: string,
  endpoint: string,
  status: number,
  elapsedTime: number,
  requestId?: string,
) {
  const logLevel = status >= 400 ? "ERROR" : status >= 300 ? "WARN" : "INFO"
  const emoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅"

  console.log(`${emoji} [${requestId}] ${method} ${endpoint} - ${status} (${elapsedTime}ms)`)
}
