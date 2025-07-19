import { type NextRequest, NextResponse } from "next/server"
import { handleWebhookEvent, validateWebhookSignature } from "@/lib/webhook-handler"
import type { BlingWebhookEvent } from "@/types/bling"

/**
 * Endpoint para receber webhooks do Bling
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    console.log(`📨 [${requestId}] Webhook recebido do Bling`)

    // Lê o corpo da requisição
    const body = await request.text()
    const signature = request.headers.get("x-bling-signature") || ""

    console.log(`📋 [${requestId}] Signature:`, signature ? "presente" : "ausente")
    console.log(`📋 [${requestId}] Body length:`, body.length)

    // Valida a assinatura do webhook (se configurada)
    if (process.env.BLING_WEBHOOK_SECRET && signature) {
      const isValid = validateWebhookSignature(body, signature)
      if (!isValid) {
        console.error(`❌ [${requestId}] Assinatura do webhook inválida`)
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
      }
      console.log(`✅ [${requestId}] Assinatura do webhook válida`)
    }

    // Parse do JSON
    let webhookData: BlingWebhookEvent
    try {
      webhookData = JSON.parse(body)
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro ao fazer parse do JSON:`, parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    console.log(`📋 [${requestId}] Evento:`, webhookData.evento?.tipo)
    console.log(`📋 [${requestId}] ID do recurso:`, webhookData.retorno?.id)

    // Processa o evento
    const processed = await handleWebhookEvent(webhookData)

    const elapsedTime = Date.now() - startTime

    if (processed) {
      console.log(`✅ [${requestId}] Webhook processado com sucesso em ${elapsedTime}ms`)
      return NextResponse.json(
        {
          success: true,
          message: "Webhook processed successfully",
          requestId,
          elapsedTime,
        },
        { status: 200 },
      )
    } else {
      console.error(`❌ [${requestId}] Falha ao processar webhook em ${elapsedTime}ms`)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process webhook",
          requestId,
          elapsedTime,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no processamento do webhook:`, error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        requestId,
        elapsedTime,
      },
      { status: 500 },
    )
  }
}

/**
 * Endpoint para verificar o status dos webhooks
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: "active",
      message: "Webhook endpoint is ready to receive Bling events",
      supportedEvents: ["produto", "pedido", "estoque", "contato"],
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to get webhook status", message: error.message }, { status: 500 })
  }
}
