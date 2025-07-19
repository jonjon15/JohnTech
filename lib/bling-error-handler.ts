import { NextResponse } from "next/server"

export interface BlingError {
  code?: string
  message: string
  details?: any
  status?: number
}

export function handleBlingError(error: any, requestId?: string): NextResponse {
  console.error(`[${requestId || "unknown"}] Bling API Error:`, error)

  // Database errors
  if (error.code) {
    switch (error.code) {
      case "23505": // Unique violation
        return NextResponse.json(
          {
            success: false,
            error: "Registro já existe",
            code: "DUPLICATE_ENTRY",
            requestId,
          },
          { status: 409 },
        )
      case "23503": // Foreign key violation
        return NextResponse.json(
          {
            success: false,
            error: "Referência inválida",
            code: "INVALID_REFERENCE",
            requestId,
          },
          { status: 400 },
        )
      case "23502": // Not null violation
        return NextResponse.json(
          {
            success: false,
            error: "Campo obrigatório não informado",
            code: "MISSING_REQUIRED_FIELD",
            requestId,
          },
          { status: 400 },
        )
      case "ECONNREFUSED":
      case "ENOTFOUND":
        return NextResponse.json(
          {
            success: false,
            error: "Erro de conexão com o banco de dados",
            code: "DATABASE_CONNECTION_ERROR",
            requestId,
          },
          { status: 503 },
        )
    }
  }

  // HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return NextResponse.json(
          {
            success: false,
            error: "Dados inválidos",
            code: "BAD_REQUEST",
            details: error.message,
            requestId,
          },
          { status: 400 },
        )
      case 401:
        return NextResponse.json(
          {
            success: false,
            error: "Token de acesso inválido ou expirado",
            code: "UNAUTHORIZED",
            requestId,
          },
          { status: 401 },
        )
      case 403:
        return NextResponse.json(
          {
            success: false,
            error: "Acesso negado",
            code: "FORBIDDEN",
            requestId,
          },
          { status: 403 },
        )
      case 404:
        return NextResponse.json(
          {
            success: false,
            error: "Recurso não encontrado",
            code: "NOT_FOUND",
            requestId,
          },
          { status: 404 },
        )
      case 429:
        return NextResponse.json(
          {
            success: false,
            error: "Limite de requisições excedido",
            code: "RATE_LIMIT_EXCEEDED",
            requestId,
          },
          { status: 429 },
        )
      case 500:
        return NextResponse.json(
          {
            success: false,
            error: "Erro interno do servidor Bling",
            code: "BLING_SERVER_ERROR",
            requestId,
          },
          { status: 502 },
        )
    }
  }

  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
      message: error.message || "Erro desconhecido",
      requestId,
    },
    { status: 500 },
  )
}

export function logRequest(requestId: string, method: string, url: string, data: any) {
  console.log(`[${requestId}] ${method} ${url}`, {
    timestamp: new Date().toISOString(),
    data: JSON.stringify(data).substring(0, 500),
  })
}

export function logResponse(requestId: string, status: number, data: any) {
  console.log(`[${requestId}] Response ${status}`, {
    timestamp: new Date().toISOString(),
    data: JSON.stringify(data).substring(0, 500),
  })
}

export function createBlingError(message: string, code?: string, status?: number): BlingError {
  return {
    message,
    code,
    status,
  }
}

export function isBlingError(error: any): error is BlingError {
  return error && typeof error.message === "string"
}
