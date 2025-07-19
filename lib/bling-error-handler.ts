import { NextResponse } from "next/server"

// Interface para o formato de erro da API Bling
export interface BlingErrorResponse {
  code: string
  message: string
  statusCode: number
  details?: any
}

// Função para criar uma resposta padronizada de erro da API
export function createBlingApiResponse(
  success: boolean,
  data: any,
  error: BlingErrorResponse | null,
  requestId: string,
): NextResponse {
  if (success) {
    return NextResponse.json({ success, data, requestId })
  } else {
    return NextResponse.json(
      {
        success,
        error: {
          code: error?.code || "UNKNOWN_ERROR",
          message: error?.message || "Ocorreu um erro inesperado.",
          details: error?.details,
          statusCode: error?.statusCode || 500,
        },
        requestId,
      },
      { status: error?.statusCode || 500 },
    )
  }
}

// Função para logar chamadas à API Bling
export function logBlingApiCall(
  requestId: string,
  method: string,
  path: string,
  payload: any,
  responseStatus?: number,
  responseBody?: any,
  error?: any,
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method,
    path,
    payload: payload ? JSON.stringify(payload) : null,
    responseStatus,
    responseBody: responseBody ? JSON.stringify(responseBody) : null,
    error: error ? (error instanceof Error ? error.message : JSON.stringify(error)) : null,
  }
  console.log("[BLING_API_CALL]", logEntry)
  // Em um ambiente de produção, você pode querer enviar isso para um serviço de log centralizado
}

// Função para tratar erros da API Bling e retornar uma resposta padronizada
export function handleBlingApiError(error: any, requestId: string): NextResponse {
  console.error(`[${requestId}] Erro na operação Bling:`, error)

  let blingError: BlingErrorResponse

  if (error instanceof Error) {
    // Erros de rede ou outros erros genéricos
    blingError = {
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "Erro interno do servidor.",
      statusCode: 500,
      details: error.stack,
    }
  } else if (error && typeof error === "object" && "error" in error && typeof error.error === "object") {
    // Erros retornados diretamente pela API Bling (ex: { error: { code, message } })
    const blingApiError = error.error as { code?: string; message?: string; details?: any }
    blingError = {
      code: blingApiError.code || "BLING_API_ERROR",
      message: blingApiError.message || "Erro retornado pela API Bling.",
      statusCode: error.statusCode || 500, // Assume statusCode se presente no objeto de erro
      details: blingApiError.details || error,
    }
  } else {
    // Erros desconhecidos
    blingError = {
      code: "UNKNOWN_ERROR",
      message: "Ocorreu um erro inesperado.",
      statusCode: 500,
      details: error,
    }
  }

  return createBlingApiResponse(false, null, blingError, requestId)
}

// Alias necessários para compatibilidade com outros módulos
export { handleBlingApiError as handleBlingError }
export { logBlingApiCall as logRequest }
