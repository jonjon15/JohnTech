import type { BlingApiError } from "@/types/bling"

/**
 * Cria uma resposta padronizada para a API Bling
 */
export function createBlingApiResponse<T>(
  success: boolean,
  data: T | null,
  error: BlingApiError | null,
): { success: boolean; data: T | null; error: BlingApiError | null } {
  return { success, data, error }
}

/**
 * Normaliza e trata erros da API Bling ou erros internos
 */
export function handleBlingApiError(rawError: any): BlingApiError {
  let code = "UNKNOWN_ERROR"
  let message = "Ocorreu um erro inesperado."
  let details: any = rawError
  let statusCode = 500

  if (rawError && typeof rawError === "object") {
    // Erros retornados diretamente pela API Bling
    if ("error" in rawError && typeof rawError.error === "object" && rawError.error !== null) {
      const blingError = rawError.error
      code = blingError.code || "BLING_API_ERROR"
      message = blingError.message || "Erro retornado pela API Bling."
      statusCode = rawError.statusCode || 500
      details = blingError
    }
    // Erros padronizados internamente
    else if ("statusCode" in rawError && "message" in rawError) {
      statusCode = rawError.statusCode
      message = rawError.message
      code = rawError.code || `HTTP_${statusCode}`
      details = rawError.details || rawError
    }
    // Erros de JavaScript
    else if (rawError instanceof Error) {
      code = "INTERNAL_SERVER_ERROR"
      message = rawError.message
      statusCode = 500
      details = rawError.stack || rawError.toString()
    }
    // Erros específicos do Bling com estrutura diferente
    else if ("errors" in rawError && Array.isArray(rawError.errors)) {
      const firstError = rawError.errors[0]
      code = firstError?.code || "BLING_VALIDATION_ERROR"
      message = firstError?.message || "Erro de validação do Bling"
      statusCode = rawError.statusCode || 400
      details = rawError.errors
    }
  } else if (typeof rawError === "string") {
    message = rawError
    code = "INTERNAL_SERVER_ERROR"
    statusCode = 500
  }

  return { code, message, details, statusCode }
}

/**
 * Registra uma chamada à API Bling no console com formatação melhorada
 */
export function logBlingApiCall(
  requestId: string,
  method: string,
  url: string,
  status: number,
  responseData: any,
  elapsedTime: number,
) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${requestId}] ${method} ${url} - ${status} (${elapsedTime}ms)`

  if (status >= 400) {
    console.error(`❌ ${logMessage}`)
    if (responseData) {
      console.error("Response:", JSON.stringify(responseData, null, 2))
    }
  } else if (status >= 300) {
    console.warn(`⚠️ ${logMessage}`)
    if (responseData) {
      console.warn("Response:", JSON.stringify(responseData, null, 2))
    }
  } else {
    console.log(`✅ ${logMessage}`)
    if (process.env.NODE_ENV === "development" && responseData) {
      console.log("Response:", JSON.stringify(responseData, null, 2))
    }
  }
}

// Aliases para compatibilidade
export { handleBlingApiError as handleBlingError }
export { logBlingApiCall as logRequest }

// Funções utilitárias adicionais
export function isBlingRateLimitError(error: BlingApiError): boolean {
  return error.statusCode === 429 || error.code === "42901"
}

export function isBlingAuthError(error: BlingApiError): boolean {
  return error.statusCode === 401 || error.code === "40101"
}

export function isBlingValidationError(error: BlingApiError): boolean {
  return error.statusCode === 400 || error.code.startsWith("400")
}

export function getBlingErrorMessage(error: BlingApiError): string {
  // Mensagens mais amigáveis para erros comuns
  const friendlyMessages: Record<string, string> = {
    "40001": "Parâmetros inválidos fornecidos",
    "40101": "Token de acesso inválido ou expirado",
    "40301": "Permissão insuficiente para acessar este recurso",
    "40401": "Recurso não encontrado",
    "40901": "Conflito - recurso já existe",
    "42901": "Limite de requisições excedido. Tente novamente em alguns minutos",
    "50001": "Erro interno do servidor Bling",
  }

  return friendlyMessages[error.code] || error.message
}
