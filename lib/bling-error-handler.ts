import type { BlingApiError } from "@/types/bling"

/**
 * Cria uma resposta padronizada para a API Bling.
 * @param success Indica se a operação foi bem-sucedida.
 * @param data Os dados retornados em caso de sucesso.
 * @param error O objeto de erro em caso de falha.
 * @returns Um objeto de resposta padronizado.
 */
export function createBlingApiResponse<T>(
  success: boolean,
  data: T | null,
  error: BlingApiError | null,
): { success: boolean; data: T | null; error: BlingApiError | null } {
  return { success, data, error }
}

/**
 * Normaliza e trata erros da API Bling ou erros internos.
 * @param rawError O erro bruto recebido (pode ser um objeto de erro do Bling, um erro de rede, etc.).
 * @returns Um objeto BlingApiError padronizado.
 */
export function handleBlingApiError(rawError: any): BlingApiError {
  let code = "UNKNOWN_ERROR"
  let message = "Ocorreu um erro inesperado."
  let details: any = rawError
  let statusCode = 500

  if (rawError && typeof rawError === "object") {
    // Erros retornados diretamente pela API Bling (ex: { error: { code: "40001", message: "..." } })
    if ("error" in rawError && typeof rawError.error === "object" && rawError.error !== null) {
      const blingError = rawError.error
      code = blingError.code || "BLING_API_ERROR"
      message = blingError.message || "Erro retornado pela API Bling."
      statusCode = rawError.statusCode || 500 // Bling pode não retornar statusCode no objeto de erro interno
      details = blingError // Manter os detalhes originais do erro Bling
    } else if ("statusCode" in rawError && "message" in rawError) {
      // Erros padronizados internamente (ex: de makeRequest)
      statusCode = rawError.statusCode
      message = rawError.message
      code = rawError.code || `HTTP_${statusCode}`
      details = rawError.details || rawError
    } else if (rawError instanceof Error) {
      // Erros de JavaScript (ex: de rede, parsing)
      code = "INTERNAL_SERVER_ERROR"
      message = rawError.message
      statusCode = 500
      details = rawError.stack || rawError.toString()
    }
  } else if (typeof rawError === "string") {
    // Erros como string
    message = rawError
    code = "INTERNAL_SERVER_ERROR"
    statusCode = 500
  }

  return { code, message, details, statusCode }
}

/**
 * Registra uma chamada à API Bling no console.
 * @param requestId ID único da requisição.
 * @param method Método HTTP.
 * @param url URL da requisição.
 * @param status Status HTTP da resposta.
 * @param responseData Dados da resposta.
 * @param elapsedTime Tempo decorrido da requisição em ms.
 */
export function logBlingApiCall(
  requestId: string,
  method: string,
  url: string,
  status: number,
  responseData: any,
  elapsedTime: number,
) {
  const logMessage = `[${requestId}] Bling API Call: ${method} ${url} - Status: ${status} - Time: ${elapsedTime}ms`
  if (status >= 400) {
    console.error(logMessage, "Response:", responseData)
  } else {
    console.log(logMessage, "Response:", responseData)
  }
}

// --- aliases exigidos pelo deploy ---
export { handleBlingApiError as handleBlingError }
export { logBlingApiCall as logRequest }
