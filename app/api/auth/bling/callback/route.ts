import { type NextRequest, NextResponse } from "next/server"
import { BlingAuth } from "@/lib/bling-auth"
import { BlingErrorHandler } from "@/lib/bling-error-handler"

/**
 * Callback OAuth 2.0 do Bling
 * https://developer.bling.com.br/aplicativos#obtenção-do-authorization-code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    console.log("📥 Callback OAuth recebido:", { code: !!code, state, error })

    // Verifica se houve erro na autorização
    if (error) {
      console.error("❌ Erro na autorização:", error, errorDescription)

      const errorMessage = this.getAuthorizationErrorMessage(error, errorDescription)
      return NextResponse.redirect(
        new URL(`/configuracao-bling?error=${encodeURIComponent(errorMessage)}`, request.url),
      )
    }

    // Verifica se o código foi fornecido
    if (!code) {
      console.error("❌ Código de autorização não fornecido")
      return NextResponse.redirect(
        new URL("/configuracao-bling?error=Código de autorização não fornecido", request.url),
      )
    }

    // Troca o código pelos tokens
    const tokens = await BlingAuth.exchangeCodeForTokens(code)

    console.log("✅ Autenticação realizada com sucesso")

    // Redireciona para página de sucesso
    return NextResponse.redirect(new URL("/configuracao-bling?success=true", request.url))
  } catch (error) {
    console.error("❌ Erro no callback OAuth:", error)

    const errorDetails = BlingErrorHandler.processApiError(error)
    const userMessage = BlingErrorHandler.getUserFriendlyMessage(error)

    return NextResponse.redirect(new URL(`/configuracao-bling?error=${encodeURIComponent(userMessage)}`, request.url))
  }
}

/**
 * Mapeia erros de autorização para mensagens amigáveis
 */
function getAuthorizationErrorMessage(error: string, description?: string | null): string {
  const errorMessages: Record<string, string> = {
    access_denied: "Acesso negado pelo usuário",
    invalid_request: "Requisição inválida",
    invalid_client: "Cliente OAuth inválido",
    invalid_scope: "Escopo inválido",
    server_error: "Erro interno do servidor",
    temporarily_unavailable: "Serviço temporariamente indisponível",
    unsupported_response_type: "Tipo de resposta não suportado",
    unauthorized_client: "Cliente não autorizado",
  }

  return errorMessages[error] || description || `Erro de autorização: ${error}`
}
