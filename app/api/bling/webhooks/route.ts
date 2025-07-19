import { type NextRequest, NextResponse } from "next/server"
import { WebhookHandler } from "@/lib/webhook-handler"
import type { BlingWebhookEvent } from "@/types/bling"

/**
 * Endpoint para receber webhooks do Bling
 * https://developer.bling.com.br/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém o payload bruto
    const payload = await request.text()
    const signature = request.headers.get("x-bling-signature") || request.headers.get("x-hub-signature-256") || ""

    console.log("📥 Webhook recebido:", {
      signature: !!signature,
      payloadLength: payload.length,
    })

    // Valida assinatura HMAC
    if (!WebhookHandler.validateSignature(payload, signature)) {
      console.error("❌ Assinatura do webhook inválida")
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
    }

    // Parse do payload
    let event: BlingWebhookEvent
    try {
      event = JSON.parse(payload)
    } catch (error) {
      console.error("❌ Payload JSON inválido:", error)
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }

    // Valida estrutura do evento
    if (!event.evento || !event.ocorrencia || !event.data) {
      console.error("❌ Estrutura do evento inválida:", event)
      return NextResponse.json({ error: "Estrutura do evento inválida" }, { status: 400 })
    }

    // Processa evento de forma assíncrona
    setImmediate(async () => {
      try {
        await WebhookHandler.processWebhookEvent(event)
      } catch (error) {
        console.error("❌ Erro ao processar webhook:", error)
      }
    })

    // Retorna sucesso imediatamente (idempotência)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("❌ Erro no endpoint de webhook:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/**
 * Endpoint para testar webhooks
 */
export async function GET() {
  try {
    const stats = await WebhookHandler.getWebhookStats()

    return NextResponse.json({
      message: "Endpoint de webhooks funcionando",
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erro ao obter estatísticas de webhooks:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
