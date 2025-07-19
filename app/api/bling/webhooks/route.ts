import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("=== WEBHOOK RECEBIDO ===")

    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")

    console.log("Webhook body:", body.substring(0, 200) + "...")
    console.log("Signature:", signature)

    // Verificar assinatura se configurada
    if (process.env.BLING_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto.createHmac("sha256", process.env.BLING_WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== `sha256=${expectedSignature}`) {
        console.error("Assinatura inválida")
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
      }
    }

    let webhookData
    try {
      webhookData = JSON.parse(body)
    } catch (parseError) {
      console.error("Erro ao fazer parse do webhook:", parseError)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    }

    console.log("Webhook data:", JSON.stringify(webhookData, null, 2))

    // Salvar webhook no banco para auditoria
    try {
      await sql`
        INSERT INTO webhook_logs (event_type, resource_id, payload, status)
        VALUES (
          ${webhookData.event || "unknown"},
          ${webhookData.data?.id || null},
          ${JSON.stringify(webhookData)},
          'received'
        )
      `
      console.log("Webhook salvo no banco")
    } catch (dbError) {
      console.error("Erro ao salvar webhook no banco:", dbError)
      // Não falhar por erro de banco
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
        console.log("Estoque alterado:", webhookData.data?.id)
        break

      default:
        console.log("Evento não reconhecido:", webhookData.event)
    }

    // Atualizar status para processado
    try {
      await sql`
        UPDATE webhook_logs 
        SET status = 'processed', processed_at = NOW()
        WHERE payload->>'event' = ${webhookData.event}
        AND payload->'data'->>'id' = ${webhookData.data?.id || ""}
        AND status = 'received'
      `
    } catch (updateError) {
      console.error("Erro ao atualizar status do webhook:", updateError)
    }

    console.log("=== WEBHOOK PROCESSADO COM SUCESSO ===")

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
      event: webhookData.event,
      resource_id: webhookData.data?.id,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("=== ERRO NO WEBHOOK ===")
    console.error("Erro:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar webhook",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Endpoint para verificar status dos webhooks
    const recentWebhooks = await sql`
      SELECT 
        event_type,
        resource_id,
        status,
        processed_at,
        COUNT(*) as count
      FROM webhook_logs 
      WHERE processed_at > NOW() - INTERVAL '24 hours'
      GROUP BY event_type, resource_id, status, processed_at
      ORDER BY processed_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      message: "Status dos webhooks",
      recent_webhooks: recentWebhooks.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao buscar webhooks:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar webhooks",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
