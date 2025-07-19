import { getPool } from "./db"
import type { BlingWebhookEvent } from "@/types/bling"

/**
 * Processa eventos de webhook recebidos do Bling
 */
export async function handleWebhookEvent(event: BlingWebhookEvent): Promise<boolean> {
  const pool = getPool()

  try {
    console.log("📨 Processando webhook event:", event.evento?.tipo)

    // Salva o evento no banco para auditoria
    await pool.query(
      `INSERT INTO webhook_events (event_type, event_data, processed)
       VALUES ($1, $2, $3)`,
      [event.evento?.tipo || "unknown", JSON.stringify(event), false],
    )

    // Processa baseado no tipo de evento
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
        return true // Marca como processado mesmo que não tenha ação específica
    }
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error)
    return false
  }
}

/**
 * Processa webhooks de produtos
 */
async function handleProductWebhook(event: BlingWebhookEvent): Promise<boolean> {
  const pool = getPool()

  try {
    const productId = event.retorno?.id
    if (!productId) {
      console.error("❌ ID do produto não encontrado no webhook")
      return false
    }

    // Aqui você pode implementar a lógica específica para produtos
    // Por exemplo: sincronizar dados do produto, atualizar cache, etc.

    console.log(`✅ Webhook de produto processado: ${productId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de produto:", error)
    return false
  }
}

/**
 * Processa webhooks de pedidos
 */
async function handleOrderWebhook(event: BlingWebhookEvent): Promise<boolean> {
  const pool = getPool()

  try {
    const orderId = event.retorno?.id
    if (!orderId) {
      console.error("❌ ID do pedido não encontrado no webhook")
      return false
    }

    // Implementar lógica específica para pedidos
    console.log(`✅ Webhook de pedido processado: ${orderId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de pedido:", error)
    return false
  }
}

/**
 * Processa webhooks de estoque
 */
async function handleStockWebhook(event: BlingWebhookEvent): Promise<boolean> {
  const pool = getPool()

  try {
    const productId = event.retorno?.id
    if (!productId) {
      console.error("❌ ID do produto não encontrado no webhook de estoque")
      return false
    }

    // Implementar lógica específica para estoque
    console.log(`✅ Webhook de estoque processado: ${productId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de estoque:", error)
    return false
  }
}

/**
 * Processa webhooks de contatos
 */
async function handleContactWebhook(event: BlingWebhookEvent): Promise<boolean> {
  const pool = getPool()

  try {
    const contactId = event.retorno?.id
    if (!contactId) {
      console.error("❌ ID do contato não encontrado no webhook")
      return false
    }

    // Implementar lógica específica para contatos
    console.log(`✅ Webhook de contato processado: ${contactId}`)
    return true
  } catch (error) {
    console.error("❌ Erro ao processar webhook de contato:", error)
    return false
  }
}

/**
 * Valida a assinatura do webhook do Bling
 */
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

/**
 * Marca um evento de webhook como processado
 */
export async function markWebhookAsProcessed(eventId: number): Promise<boolean> {
  const pool = getPool()

  try {
    await pool.query(
      `UPDATE webhook_events 
       SET processed = true, processed_at = NOW() 
       WHERE id = $1`,
      [eventId],
    )
    return true
  } catch (error) {
    console.error("❌ Erro ao marcar webhook como processado:", error)
    return false
  }
}

/**
 * Obtém eventos de webhook não processados
 */
export async function getUnprocessedWebhooks(): Promise<any[]> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT * FROM webhook_events 
       WHERE processed = false 
       ORDER BY created_at ASC 
       LIMIT 100`,
    )
    return result.rows
  } catch (error) {
    console.error("❌ Erro ao buscar webhooks não processados:", error)
    return []
  }
}
