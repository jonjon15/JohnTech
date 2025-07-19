/**
 * Manipulador de erros da API do Bling
 * Baseado em: https://developer.bling.com.br/erros-comuns
 */

export interface BlingErrorDetails {
  code: string
  message: string
  description?: string
  field?: string
  value?: any
}

export class BlingErrorHandler {
  /**
   * Mapeia códigos de erro HTTP para mensagens amigáveis
   */
  private static readonly HTTP_ERROR_MESSAGES: Record<number, string> = {
    400: "Requisição inválida - verifique os dados enviados",
    401: "Não autorizado - token de acesso inválido ou expirado",
    403: "Acesso negado - permissões insuficientes",
    404: "Recurso não encontrado",
    422: "Dados inválidos - verifique os campos obrigatórios",
    429: "Muitas requisições - limite de taxa excedido",
    500: "Erro interno do servidor",
    502: "Servidor indisponível",
    503: "Serviço temporariamente indisponível",
  }

  /**
   * Mapeia códigos de erro específicos do Bling
   */
  private static readonly BLING_ERROR_CODES: Record<string, string> = {
    // Erros de validação
    validation_error: "Erro de validação nos dados enviados",
    missing_required_field_error: "Campo obrigatório não informado",
    invalid_field_format_error: "Formato de campo inválido",
    invalid_field_value_error: "Valor de campo inválido",

    // Erros de autenticação
    unauthorized: "Token de acesso inválido ou expirado",
    forbidden: "Acesso negado - permissões insuficientes",
    invalid_client: "Cliente OAuth inválido",
    invalid_grant: "Grant de autorização inválido",
    unsupported_grant_type: "Tipo de grant não suportado",

    // Erros de recursos
    resource_not_found: "Recurso não encontrado",
    resource_already_exists: "Recurso já existe",
    resource_conflict: "Conflito com recurso existente",

    // Erros de limite
    too_many_requests: "Limite de requisições excedido",
    quota_exceeded: "Cota de uso excedida",

    // Erros do servidor
    server_error: "Erro interno do servidor",
    service_unavailable: "Serviço temporariamente indisponível",
    timeout_error: "Timeout na requisição",

    // Erros específicos do Bling
    company_inactive: "Empresa inativa no Bling",
    user_not_authorized: "Usuário não autorizado para esta operação",
    application_not_authorized: "Aplicação não autorizada",
    application_inactive: "Aplicação inativa",
    authorization_code_already_used: "Código de autorização já utilizado",
    token_expired: "Token expirado",
    invalid_webhook_signature: "Assinatura do webhook inválida",
  }

  /**
   * Processa erro da API e retorna detalhes estruturados
   */
  static processApiError(error: any): BlingErrorDetails {
    // Erro HTTP simples
    if (error.status && typeof error.status === "number") {
      return {
        code: `HTTP_${error.status}`,
        message: this.HTTP_ERROR_MESSAGES[error.status] || `Erro HTTP ${error.status}`,
        description: error.message || error.statusText,
      }
    }

    // Erro estruturado do Bling
    if (error.error && typeof error.error === "object") {
      const blingError = error.error
      return {
        code: blingError.type || blingError.code || "unknown_error",
        message: this.BLING_ERROR_CODES[blingError.type] || blingError.message || "Erro desconhecido",
        description: blingError.description || blingError.message,
        field: blingError.field,
        value: blingError.value,
      }
    }

    // Array de erros do Bling
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0]
      if (firstError && firstError.error) {
        return this.processApiError(firstError)
      }
    }

    // Erro de rede ou JavaScript
    if (error instanceof Error) {
      return {
        code: error.name || "network_error",
        message: error.message || "Erro de conexão",
        description: "Verifique sua conexão com a internet",
      }
    }

    // Erro genérico
    return {
      code: "unknown_error",
      message: "Erro desconhecido",
      description: typeof error === "string" ? error : JSON.stringify(error),
    }
  }

  /**
   * Gera mensagem de erro amigável para o usuário
   */
  static getUserFriendlyMessage(error: any): string {
    const details = this.processApiError(error)

    switch (details.code) {
      case "HTTP_401":
      case "unauthorized":
      case "token_expired":
        return "Sua sessão expirou. Faça login novamente."

      case "HTTP_403":
      case "forbidden":
      case "user_not_authorized":
        return "Você não tem permissão para realizar esta operação."

      case "HTTP_404":
      case "resource_not_found":
        return "O item solicitado não foi encontrado."

      case "HTTP_422":
      case "validation_error":
      case "missing_required_field_error":
        return `Dados inválidos: ${details.description || "verifique os campos obrigatórios"}`

      case "HTTP_429":
      case "too_many_requests":
        return "Muitas requisições. Aguarde alguns minutos e tente novamente."

      case "HTTP_500":
      case "HTTP_502":
      case "HTTP_503":
      case "server_error":
      case "service_unavailable":
        return "Serviço temporariamente indisponível. Tente novamente em alguns minutos."

      case "company_inactive":
        return "Sua empresa está inativa no Bling. Entre em contato com o suporte."

      case "application_not_authorized":
      case "application_inactive":
        return "Aplicação não autorizada. Verifique as configurações no painel do Bling."

      case "invalid_webhook_signature":
        return "Assinatura do webhook inválida. Verifique a configuração da chave secreta."

      default:
        return details.message || "Ocorreu um erro inesperado. Tente novamente."
    }
  }

  /**
   * Verifica se o erro é recuperável (pode fazer retry)
   */
  static isRetryableError(error: any): boolean {
    const details = this.processApiError(error)

    const retryableCodes = [
      "HTTP_429", // Rate limit
      "HTTP_500", // Server error
      "HTTP_502", // Bad gateway
      "HTTP_503", // Service unavailable
      "timeout_error",
      "network_error",
      "ECONNRESET",
      "ETIMEDOUT",
    ]

    return retryableCodes.includes(details.code)
  }

  /**
   * Verifica se o erro requer nova autenticação
   */
  static requiresReauth(error: any): boolean {
    const details = this.processApiError(error)

    const reauthCodes = ["HTTP_401", "unauthorized", "token_expired", "invalid_grant"]

    return reauthCodes.includes(details.code)
  }

  /**
   * Calcula tempo de espera para retry baseado no erro
   */
  static getRetryDelay(error: any, attempt: number): number {
    const details = this.processApiError(error)

    // Rate limit - usar Retry-After se disponível
    if (details.code === "HTTP_429" || details.code === "too_many_requests") {
      return 60000 // 1 minuto padrão
    }

    // Backoff exponencial para outros erros
    return Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 segundos
  }

  /**
   * Loga erro de forma estruturada
   */
  static logError(error: any, context?: string): void {
    const details = this.processApiError(error)

    console.error("🚨 Erro da API Bling:", {
      context: context || "unknown",
      code: details.code,
      message: details.message,
      description: details.description,
      field: details.field,
      value: details.value,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Cria erro customizado com detalhes estruturados
   */
  static createError(code: string, message: string, description?: string): Error {
    const error = new Error(message)
    error.name = code
    ;(error as any).description = description
    return error
  }
}
