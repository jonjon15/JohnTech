export interface NormalizedBlingError {
  code: string
  message: string
  statusCode: number
  details?: unknown
}

/**
 * Converte qualquer erro em um formato padrão usado no projeto
 */
export function handleBlingError(err: unknown): NormalizedBlingError {
  if (typeof err === "object" && err && "error" in err && typeof (err as any).error === "object") {
    const { code, message } = (err as any).error
    return {
      code: code?.toString() ?? "BLING_ERROR",
      message: message ?? "Erro retornado pela API Bling",
      statusCode: (err as any).statusCode ?? 400,
      details: err,
    }
  }

  if (err instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: err.message,
      statusCode: 500,
      details: err.stack,
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Erro desconhecido",
    statusCode: 500,
    details: err,
  }
}

/**
 * Loga de forma amigável uma chamada feita à API Bling
 */
export function logRequest(requestId: string, info: unknown) {
  // Use console.log; em produção você poderia usar um logger estruturado
  console.log(`📡 [${requestId}]`, JSON.stringify(info, null, 2))
}
