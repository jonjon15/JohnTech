import { type NextRequest, NextResponse } from "next/server"
import { saveWebhookLog } from "@/lib/db"
import crypto from "crypto"

const WEBHOOK_SECRET = process.env.BLING_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook recebido")

    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")

    // Validar assinatura se configurada
    if (WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== `sha256=${expectedSignature}`) {
        console.error("❌ Assinatura inválida")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)
    console.log("📦 Payload:", payload)

    // Extrair informações do webhook
    const eventType = payload.event || payload.action || "unknown"
    const resourceId = payload.data?.id || payload.id || null

    // Salvar log do webhook
    await saveWebhookLog(eventType, resourceId, payload, "received")

    // Processar diferentes tipos de eventos
    switch (eventType) {
      case "produto.criado":
      case "produto.atualizado":
      case "produto.excluido":
        console.log(`📦 Evento de produto: ${eventType}`)
        break

      case "pedido.criado":
      case "pedido.atualizado":
        console.log(`🛒 Evento de pedido: ${eventType}`)
        break

      case "estoque.atualizado":
        console.log(`📊 Evento de estoque: ${eventType}`)
        break

      default:
        console.log(`❓ Evento desconhecido: ${eventType}`)
    }

    // Marcar como processado
    await saveWebhookLog(eventType, resourceId, payload, "processed")

    return NextResponse.json({
      success: true,
      message: "Webhook processado",
      eventType,
      resourceId,
    })
  } catch (error) {
    console.error("❌ Erro no webhook:", error)
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de webhooks ativo",
    timestamp: new Date().toISOString(),
  })
}
