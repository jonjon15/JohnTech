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
 * Cria uma resposta padronizada da API Bling
 */
export function createBlingApiResponse<T>(
  success: boolean,
  data?: T,
  error?: BlingError,
  meta?: any,
): BlingApiResponse<T> {
  return {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      ...meta,
    },
  }
}

/**
 * Trata erros da API Bling conforme documentação
 */
export function handleBlingApiError(error: any, context = "unknown"): BlingError {
  console.error(`🚨 Bling API Error (${context}):`, error)

  // Erro de validação (validation_error)
  if (error.response?.data?.error?.type === "validation_error") {
    return {
      code: "VALIDATION_ERROR",
      message: error.response.data.error.message || "Dados inválidos",
      statusCode: 422,
      details: error.response.data.error.fields,
    }
  }

  // Campo obrigatório ausente (missing_required_field_error)
  if (error.response?.data?.error?.type === "missing_required_field_error") {
    return {
      code: "MISSING_REQUIRED_FIELD",
      message: error.response.data.error.message || "Campo obrigatório ausente",
      statusCode: 400,
      details: error.response.data.error.field,
    }
  }

  // Erro desconhecido (unknown_error)
  if (error.response?.data?.error?.type === "unknown_error") {
    return {
      code: "UNKNOWN_ERROR",
      message: "Erro interno do servidor",
      statusCode: 500,
    }
  }

  // Não autorizado (401)
  if (error.response?.status === 401) {
    return {
      code: "UNAUTHORIZED",
      message: "Token de acesso inválido ou expirado",
      statusCode: 401,
    }
  }

  // Proibido (403)
  if (error.response?.status === 403) {
    return {
      code: "FORBIDDEN",
      message: "Acesso negado. Verifique as permissões do aplicativo",
      statusCode: 403,
    }
  }

  // Recurso não encontrado (404)
  if (error.response?.status === 404) {
    return {
      code: "RESOURCE_NOT_FOUND",
      message: "Recurso não encontrado",
      statusCode: 404,
    }
  }

  // Muitas requisições (429)
  if (error.response?.status === 429) {
    return {
      code: "TOO_MANY_REQUESTS",
      message: "Limite de requisições excedido. Tente novamente em alguns minutos",
      statusCode: 429,
    }
  }

  // Erro do servidor (500+)
  if (error.response?.status >= 500) {
    return {
      code: "SERVER_ERROR",
      message: "Erro interno do servidor Bling",
      statusCode: error.response.status,
    }
  }

  // Timeout
  if (error.name === "AbortError" || error.code === "ABORT_ERR") {
    return {
      code: "TIMEOUT",
      message: "Timeout na requisição",
      statusCode: 408,
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

  // Erro genérico
  return {
    code: "UNKNOWN_ERROR",
    message: error.message || "Erro desconhecido",
    statusCode: 500,
    details: error,
  }
}

/**
 * Registra chamadas da API para auditoria
 */
export function logBlingApiCall(
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  requestId?: string,
): void {
  const emoji = statusCode >= 200 && statusCode < 300 ? "✅" : "❌"
  console.log(`${emoji} [${requestId || "no-id"}] ${method} ${endpoint} - ${statusCode} (${duration}ms)`)
}
