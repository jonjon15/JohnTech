import { type NextRequest, NextResponse } from "next/server"
import { saveWebhookLog } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] Webhook recebido`)

    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")
    const eventType = request.headers.get("x-bling-event")

    console.log(`📋 [${requestId}] Event Type: ${eventType}`)
    console.log(`🔐 [${requestId}] Signature: ${signature}`)

    // Validar assinatura do webhook
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

      if (signature !== `sha256=${expectedSignature}`) {
        console.error(`❌ [${requestId}] Assinatura inválida`)
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      console.error(`❌ [${requestId}] JSON inválido:`, error)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log(`📦 [${requestId}] Payload:`, payload)

    // Salvar log do webhook
    const resourceId = payload?.data?.id?.toString() || null
    await saveWebhookLog(eventType || "unknown", resourceId, payload, "received")

    // Processar webhook baseado no tipo de evento
    let processedData = null
    switch (eventType) {
      case "produto.criado":
      case "produto.atualizado":
      case "produto.excluido":
        processedData = await processProductWebhook(payload, eventType)
        break
      case "pedido.criado":
      case "pedido.atualizado":
        processedData = await processOrderWebhook(payload, eventType)
        break
      case "estoque.atualizado":
        processedData = await processStockWebhook(payload, eventType)
        break
      default:
        console.log(`⚠️ [${requestId}] Tipo de evento não processado: ${eventType}`)
    }

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Webhook processado em ${elapsedTime}ms`)

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
      event_type: eventType,
      processed_data: processedData,
      elapsed_time: elapsedTime,
      request_id: requestId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no webhook:`, error)

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar webhook",
        error: error.message,
        elapsed_time: elapsedTime,
        request_id: requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function processProductWebhook(payload: any, eventType: string) {
  console.log(`🛍️ Processando webhook de produto: ${eventType}`)
  // Implementar lógica específica para produtos
  return { type: "product", action: eventType, data: payload.data }
}

async function processOrderWebhook(payload: any, eventType: string) {
  console.log(`📦 Processando webhook de pedido: ${eventType}`)
  // Implementar lógica específica para pedidos
  return { type: "order", action: eventType, data: payload.data }
}

async function processStockWebhook(payload: any, eventType: string) {
  console.log(`📊 Processando webhook de estoque: ${eventType}`)
  // Implementar lógica específica para estoque
  return { type: "stock", action: eventType, data: payload.data }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint ativo",
    methods: ["POST"],
    events: [
      "produto.criado",
      "produto.atualizado",
      "produto.excluido",
      "pedido.criado",
      "pedido.atualizado",
      "estoque.atualizado",
    ],
    timestamp: new Date().toISOString(),
  })
}
