import { type NextRequest, NextResponse } from "next/server"
import { createWebhookLog } from "@/lib/db" // Assumindo que createWebhookLog existe em lib/db

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint ativo",
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: "/api/bling/webhooks",
      status: "/api/bling/webhooks/status",
    },
  })
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    console.log(`[${requestId}] Webhook recebido`)

    // Verificar se há um secret no header (opcional)
    const webhookSecret = request.headers.get("x-bling-webhook-secret")
    const expectedSecret = process.env.BLING_WEBHOOK_SECRET

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn(`[${requestId}] Webhook secret inválido`)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhook secret",
        },
        { status: 401 },
      )
    }

    const payload = await request.json()
    const eventType = payload.event || "unknown"
    const resourceId = payload.data?.id || null

    console.log(`[${requestId}] Evento: ${eventType}, Resource: ${resourceId}`)

    // Salvar log do webhook
    // Certifique-se de que createWebhookLog está implementado em lib/db.ts
    // ou mova esta lógica para um handler de webhook mais específico.
    await createWebhookLog(eventType, payload, resourceId)

    // Processar diferentes tipos de eventos
    switch (eventType) {
      case "produto.criado":
      case "produto.atualizado":
      case "produto.excluido":
        console.log(`[${requestId}] Processando evento de produto: ${eventType}`)
        // Aqui você pode adicionar lógica específica para produtos
        break

      case "pedido.criado":
      case "pedido.atualizado":
        console.log(`[${requestId}] Processando evento de pedido: ${eventType}`)
        // Aqui você pode adicionar lógica específica para pedidos
        break

      case "estoque.atualizado":
        console.log(`[${requestId}] Processando evento de estoque: ${eventType}`)
        // Aqui você pode adicionar lógica específica para estoque
        break

      default:
        console.log(`[${requestId}] Evento não reconhecido: ${eventType}`)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
      eventType,
      resourceId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error(`[${requestId}] Erro ao processar webhook:`, error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
