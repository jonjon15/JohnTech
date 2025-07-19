import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("=== WEBHOOK RECEBIDO ===")

    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")

    console.log("Headers:", Object.fromEntries(request.headers.entries()))
    console.log("Body:", body)
    console.log("Signature:", signature)

    // Verificar assinatura do webhook se configurada
    if (process.env.BLING_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto.createHmac("sha256", process.env.BLING_WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== expectedSignature) {
        console.error("Assinatura inválida do webhook")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (error) {
      console.error("Erro ao fazer parse do webhook:", error)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log("Dados do webhook:", JSON.stringify(webhookData, null, 2))

    // Salvar webhook no banco para auditoria
    try {
      await sql`
        INSERT INTO bling_webhook_logs (event_type, payload, signature, processed_at, status)
        VALUES (
          ${webhookData.event || "unknown"}, 
          ${JSON.stringify(webhookData)}, 
          ${signature || null}, 
          NOW(), 
          'received'
        )
      `
    } catch (dbError) {
      console.error("Erro ao salvar webhook no banco:", dbError)
      // Continua mesmo com erro de DB
    }

    // Processar diferentes tipos de eventos
    switch (webhookData.event) {
      case "produto.criado":
        console.log("Produto criado:", webhookData.data?.id)
        break
      case "produto.atualizado":
        console.log("Produto atualizado:", webhookData.data?.id)
        break
      case "produto.excluido":
        console.log("Produto excluído:", webhookData.data?.id)
        break
      case "estoque.alterado":
        console.log("Estoque alterado:", webhookData.data)
        break
      default:
        console.log("Evento não reconhecido:", webhookData.event)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
      event: webhookData.event,
    })
  } catch (error: any) {
    console.error("=== ERRO NO WEBHOOK ===")
    console.error("Erro ao processar webhook:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Endpoint para verificar status dos webhooks
    const result = await sql`
      SELECT 
        event_type,
        COUNT(*) as total,
        MAX(processed_at) as last_received
      FROM bling_webhook_logs 
      WHERE processed_at > NOW() - INTERVAL '24 hours'
      GROUP BY event_type
      ORDER BY total DESC
    `

    return NextResponse.json({
      status: "Webhook endpoint ativo",
      last_24h_events: result.rows,
      endpoint_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/bling/webhooks`,
    })
  } catch (error: any) {
    console.error("Erro ao verificar status dos webhooks:", error)
    return NextResponse.json({ error: "Erro ao verificar status", message: error.message }, { status: 500 })
  }
}
