export interface BlingError {
  type: string
  message: string
  code?: string
  details?: any
}

export class BlingApiError extends Error {
  public readonly type: string
  public readonly code?: string
  public readonly details?: any

  constructor(type: string, message: string, code?: string, details?: any) {
    super(message)
    this.name = "BlingApiError"
    this.type = type
    this.code = code
    this.details = details
  }
}

export function handleBlingApiError(response: Response, data: any): BlingApiError {
  const status = response.status

  switch (status) {
    case 400:
      if (data.error?.type === "validation_error") {
        return new BlingApiError("validation_error", "Dados de entrada inválidos", data.error.code, data.error.fields)
      }
      if (data.error?.type === "missing_required_field_error") {
        return new BlingApiError(
          "missing_required_field_error",
          "Campo obrigatório não informado",
          data.error.code,
          data.error.field,
        )
      }
      return new BlingApiError("bad_request", "Requisição inválida", undefined, data)

    case 401:
      return new BlingApiError("unauthorized", "Token de acesso inválido ou expirado")

    case 403:
      return new BlingApiError("forbidden", "Acesso negado - verifique as permissões do token")

    case 404:
      return new BlingApiError("resource_not_found", "Recurso não encontrado")

    case 422:
      return new BlingApiError("unprocessable_entity", "Entidade não processável", undefined, data.error?.details)

    case 429:
      const retryAfter = response.headers.get("retry-after")
      return new BlingApiError(
        "too_many_requests",
        `Limite de requisições excedido. Tente novamente em ${retryAfter || "60"} segundos`,
        undefined,
        { retryAfter },
      )

    case 500:
      return new BlingApiError("server_error", "Erro interno do servidor Bling")

    case 502:
    case 503:
    case 504:
      return new BlingApiError("service_unavailable", "Serviço temporariamente indisponível")

    default:
      return new BlingApiError("unknown_error", `Erro desconhecido (${status})`, undefined, data)
  }
}

export function getErrorMessage(error: BlingApiError): string {
  const messages: Record<string, string> = {
    validation_error: "Os dados fornecidos são inválidos. Verifique os campos e tente novamente.",
    missing_required_field_error: "Um campo obrigatório não foi preenchido.",
    unauthorized: "Sua sessão expirou. Faça login novamente.",
    forbidden: "Você não tem permissão para realizar esta ação.",
    resource_not_found: "O recurso solicitado não foi encontrado.",
    too_many_requests: "Muitas requisições foram feitas. Aguarde um momento e tente novamente.",
    server_error: "Erro interno do servidor. Tente novamente mais tarde.",
    service_unavailable: "Serviço temporariamente indisponível. Tente novamente em alguns minutos.",
    unknown_error: "Ocorreu um erro inesperado. Tente novamente.",
  }

  return messages[error.type] || error.message
}
