import { getPool } from "./db"
import type { BlingWebhookEvent } from "@/types/bling"

export async function handleWebhookEvent(event: BlingWebhookEvent): Promise<boolean> {
  const pool = getPool()

  try {
    console.log("📨 Processando webhook event:", event.evento?.tipo)

    await pool.query(`INSERT INTO webhook_events (event_type, event_data, processed) VALUES ($1, $2, $3)`, [
      event.evento?.tipo || "unknown",
      JSON.stringify(event),
      false,
    ])

    switch (event.evento?.tipo) {
      case "produto":
        return await handleProductWebhook(event)
      case "pedido":
        return await handleOrderWebhook(event)
      case "estoque":
        return await handleStockWebhook(event)
      case "contato":
        return await handleContactWebhook(event)
      default:
        console.log(`⚠️ Tipo de webhook não tratado: ${event.evento?.tipo}`)
        return true
    }
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error)
    return false
  }
}

async function handleProductWebhook(event: BlingWebhookEvent): Promise<boolean> {
  try {
    const productId = event.retorno?.id
    if (!productId) {
      console.error("❌ ID do produto não encontrado no webhook")
      return false
    }

    console.log(`✅ Webhook de produto processado: ${productId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de produto:", error)
    return false
  }
}

async function handleOrderWebhook(event: BlingWebhookEvent): Promise<boolean> {
  try {
    const orderId = event.retorno?.id
    if (!orderId) {
      console.error("❌ ID do pedido não encontrado no webhook")
      return false
    }

    console.log(`✅ Webhook de pedido processado: ${orderId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de pedido:", error)
    return false
  }
}

async function handleStockWebhook(event: BlingWebhookEvent): Promise<boolean> {
  try {
    const productId = event.retorno?.id
    if (!productId) {
      console.error("❌ ID do produto não encontrado no webhook de estoque")
      return false
    }

    console.log(`✅ Webhook de estoque processado: ${productId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de estoque:", error)
    return false
  }
}

async function handleContactWebhook(event: BlingWebhookEvent): Promise<boolean> {
  try {
    const contactId = event.retorno?.id
    if (!contactId) {
      console.error("❌ ID do contato não encontrado no webhook")
      return false
    }

    console.log(`✅ Webhook de contato processado: ${contactId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de contato:", error)
    return false
  }
}

export function validateWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require("crypto")
  const secret = process.env.BLING_WEBHOOK_SECRET

  if (!secret) {
    console.error("❌ BLING_WEBHOOK_SECRET não configurado")
    return false
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return signature === expectedSignature
}

export async function markWebhookAsProcessed(eventId: number): Promise<boolean> {
  const pool = getPool()

  try {
    await pool.query(`UPDATE webhook_events SET processed = true, processed_at = NOW() WHERE id = $1`, [eventId])
    return true
  } catch (error) {
    console.error("❌ Erro ao marcar webhook como processado:", error)
    return false
  }
}

export async function getUnprocessedWebhooks(): Promise<any[]> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT * FROM webhook_events WHERE processed = false ORDER BY created_at ASC LIMIT 100`,
    )
    return result.rows
  } catch (error) {
    console.error("❌ Erro ao buscar webhooks não processados:", error)
    return []
  }
}
