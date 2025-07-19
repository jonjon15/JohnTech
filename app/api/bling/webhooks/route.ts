import { type NextRequest, NextResponse } from "next/server"
import { logWebhook } from "@/lib/db"
import { handleWebhookEvent } from "@/lib/webhook-handler"
import crypto from "crypto"

/**
 * Rota para receber webhooks do Bling.
 * Valida a assinatura do webhook e processa o evento.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  console.log(`🔄 [${requestId}] Webhook Recebido - INÍCIO`)

  try {
    // O Bling envia o secret no cabeçalho 'x-bling-hmac-sha256'
    const signature = request.headers.get("x-bling-hmac-sha256")
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
      console.error(`❌ [${requestId}] Webhook: Assinatura ou segredo não fornecidos.`)
      return NextResponse.json({ message: "Unauthorized: Missing signature or secret" }, { status: 401 })
    }

    const rawBody = await request.text() // Obter o corpo RAW para validação da assinatura
    const jsonBody = JSON.parse(rawBody) // Parsear para uso posterior

    // Implementar a validação da assinatura HMAC-SHA256
    const hmac = crypto.createHmac("sha256", webhookSecret)
    hmac.update(rawBody)
    const digest = hmac.digest("hex")
    if (digest !== signature) {
      console.error(`❌ [${requestId}] Webhook: Assinatura inválida.`)
      return NextResponse.json({ message: "Unauthorized: Invalid signature" }, { status: 401 })
    }
    console.log(`✅ [${requestId}] Webhook: Assinatura validada.`)

    const eventType = jsonBody.evento?.tipo || "unknown"
    const resourceId = jsonBody.retorno?.id || "unknown"

    console.log(`📋 [${requestId}] Webhook: Tipo de evento: ${eventType}, ID do recurso: ${resourceId}`)

    // Logar o webhook antes de processar
    await logWebhook(eventType, resourceId, jsonBody)
    console.log(`💾 [${requestId}] Webhook logado no DB.`)

    // Processar o evento do webhook
    await handleWebhookEvent(jsonBody)
    console.log(`✅ [${requestId}] Webhook processado com sucesso.`)

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Webhook concluído em ${elapsedTime}ms`)
    return NextResponse.json({ message: "Webhook received and processed" }, { status: 200 })
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no processamento do webhook:`, error)
    return NextResponse.json(
      { message: "Internal Server Error", details: error.message || "Unknown error" },
      { status: 500 },
    )
  }
}
