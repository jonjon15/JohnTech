export interface BlingError {
  code: string
  message: string
  statusCode?: number
  details?: any
}

export interface BlingApiResponse<T = any> {
  success: boolean
  data?: T
  error?: BlingError
  meta?: {
    request_id?: string
    elapsed_time?: number
    timestamp: string
  }
}

/**
 * Constrói um objeto de resposta padronizado da API Bling.
 */
export function createBlingApiResponse<T>(
  success: boolean,
  data?: T,
  error?: BlingError,
  meta?: Partial<BlingApiResponse["meta"]>,
): BlingApiResponse<T> {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

/**
 * Converte qualquer erro capturado em um BlingError amigável.
 */
export function handleBlingApiError(error: any, context = "unknown"): BlingError {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  console.error(`🚨 Bling API Error (${context}):`, error)

  // Timeout ou abort
  if (error.name === "AbortError" || error.code === "ABORT_ERR") {
    return {
      code: "TIMEOUT",
      message: "Timeout na requisição para a API do Bling",
      statusCode: 408,
    }
  }

  // Resposta HTTP com erro
  if (error.response) {
    const status = error.response.status
    const data = error.response.data
    return {
      code: `HTTP_${status}`,
      message: data?.error?.message ?? data?.message ?? `Erro HTTP ${status}`,
      statusCode: status,
      details: data,
    }
  }

  // Erro de conexão
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return {
      code: "CONNECTION_ERROR",
      message: "Erro de conexão com a API do Bling",
      statusCode: 503,
    }
  }

  // Erro de autenticação
  if (error.message?.includes("token") || error.message?.includes("unauthorized")) {
    return {
      code: "AUTH_ERROR",
      message: "Token de acesso inválido ou expirado",
      statusCode: 401,
    }
  }

  // Erro genérico
  return {
    code: "UNKNOWN_ERROR",
    message: error.message ?? "Erro desconhecido na API do Bling",
    statusCode: 500,
    details: error,
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}

/**
 * Registra no console um resumo da chamada à API Bling.
 */
export function logBlingApiCall(
  method: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
  requestId?: string,
): void {
  const ok = statusCode >= 200 && statusCode < 300
  const emoji = ok ? "✅" : "❌"
  console.log(
    `${emoji} [${requestId ?? "no-id"}] ${method.toUpperCase()} ${endpoint} - ${statusCode} (${durationMs}ms)`,
  )
}
