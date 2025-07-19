import { NextResponse } from "next/server"
import { BlingAuth } from "@/lib/bling-auth"
import { BlingApiClient } from "@/lib/bling-api-client"
import { WebhookHandler } from "@/lib/webhook-handler"

/**
 * Endpoint para verificar status da integração com Bling
 */
export async function GET() {
  try {
    console.log("🔍 Verificando status da integração...")

    // Verifica autenticação
    const authStatus = await BlingAuth.getAuthStatus()

    // Verifica conectividade com API
    const apiConnected = authStatus.authenticated ? await BlingApiClient.testConnection() : false

    // Obtém estatísticas de rate limit
    const rateLimit = BlingApiClient.getRateLimit()

    // Obtém estatísticas de webhooks
    const webhookStats = await WebhookHandler.getWebhookStats()

    const status = {
      timestamp: new Date().toISOString(),
      authentication: {
        authenticated: authStatus.authenticated,
        expiresAt: authStatus.expiresAt,
        userInfo: authStatus.userInfo,
      },
      api: {
        connected: apiConnected,
        rateLimit: {
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetAt: new Date(rateLimit.reset).toISOString(),
        },
      },
      webhooks: webhookStats,
      overall: {
        status: authStatus.authenticated && apiConnected ? "healthy" : "error",
        message: authStatus.authenticated
          ? apiConnected
            ? "Integração funcionando normalmente"
            : "Problemas de conectividade com a API"
          : "Não autenticado",
      },
    }

    console.log("✅ Status verificado:", status.overall.status)

    return NextResponse.json(status)
  } catch (error) {
    console.error("❌ Erro ao verificar status:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overall: {
          status: "error",
          message: "Erro ao verificar status da integração",
        },
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
