import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("=== WEBHOOK RECEBIDO ===")

    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")

    console.log("Signature recebida:", signature)
    console.log("Body:", body.substring(0, 200) + "...")

    // Verificar assinatura do webhook
    if (signature && process.env.BLING_WEBHOOK_SECRET) {
      const expectedSignature = crypto.createHmac("sha256", process.env.BLING_WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== expectedSignature) {
        console.error("Assinatura inválida do webhook")
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
      }
    }

    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (error) {
      console.error("Erro ao fazer parse do webhook:", error)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    }

    console.log("Dados do webhook:", JSON.stringify(webhookData, null, 2))

    // Processar diferentes tipos de webhook
    const { event, data } = webhookData

    switch (event) {
      case "produto.criado":
        console.log("Produto criado:", data.id)
        break
      case "produto.atualizado":
        console.log("Produto atualizado:", data.id)
        break
      case "produto.excluido":
        console.log("Produto excluído:", data.id)
        break
      case "estoque.alterado":
        console.log("Estoque alterado:", data)
        break
      default:
        console.log("Evento não reconhecido:", event)
    }

    // Aqui você processaria o webhook conforme sua lógica de negócio
    // Por exemplo, atualizar banco de dados local, sincronizar dados, etc.

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
      event: event,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json(
      {
        error: "Erro interno ao processar webhook",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de webhooks do Bling",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/bling/webhooks`,
    methods: ["POST"],
    events: ["produto.criado", "produto.atualizado", "produto.excluido", "estoque.alterado"],
  })
}
