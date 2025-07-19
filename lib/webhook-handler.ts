import crypto from "crypto"
import type { BlingWebhookEvent } from "@/types/bling"
import { getPool } from "./db"

const WEBHOOK_SECRET =
  process.env.BLING_WEBHOOK_SECRET || "09cd0c191a2d7d849609870b9166ab3b74e76ba95df54f0237bce24fb2af1e8b"

/**
 * Manipulador de webhooks do Bling
 * Baseado em: https://developer.bling.com.br/webhooks
 */
export class WebhookHandler {
  /**
   * Valida assinatura HMAC do webhook
   * https://developer.bling.com.br/webhooks#validação-do-hash
   */
  static validateSignature(payload: string, signature: string): boolean {
    if (!WEBHOOK_SECRET) {
      console.warn("⚠️ BLING_WEBHOOK_SECRET não configurado")
      return false
    }

    try {
      const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload, "utf8").digest("hex")

      // Remove prefixo 'sha256=' se presente
      const cleanSignature = signature.replace("sha256=", "")

      return crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(cleanSignature, "hex"))
    } catch (error) {
      console.error("❌ Erro ao validar assinatura do webhook:", error)
      return false
    }
  }

  /**
   * Processa evento de webhook
   */
  static async processWebhookEvent(event: BlingWebhookEvent): Promise<void> {
    const pool = getPool()

    try {
      console.log(`📥 Processando webhook: ${event.evento}`)

      // Salva log do evento
      await pool.query(
        `INSERT INTO bling_webhook_logs (evento, ocorrencia, data_evento, payload, processado)
         VALUES ($1, $2, $3, $4, $5)`,
        [event.evento, event.ocorrencia, new Date(), JSON.stringify(event), false],
      )

      // Processa baseado no tipo de evento
      switch (event.evento) {
        case "produto":
          await this.processProductEvent(event)
          break
        case "pedido":
          await this.processOrderEvent(event)
          break
        case "estoque":
          await this.processStockEvent(event)
          break
        case "contato":
          await this.processContactEvent(event)
          break
        default:
          console.log(`ℹ️ Evento não processado: ${event.evento}`)
      }

      // Marca como processado
      await pool.query(
        `UPDATE bling_webhook_logs 
         SET processado = true 
         WHERE evento = $1 AND data_evento = $2`,
        [event.evento, new Date()],
      )

      console.log(`✅ Webhook processado: ${event.evento}`)
    } catch (error) {
      console.error(`❌ Erro ao processar webhook ${event.evento}:`, error)

      // Salva erro no log
      await pool.query(
        `UPDATE bling_webhook_logs 
         SET erro = $1 
         WHERE evento = $2 AND processado = false`,
        [error instanceof Error ? error.message : String(error), event.evento],
      )

      throw error
    }
  }

  /**
   * Processa evento de produto
   */
  private static async processProductEvent(event: BlingWebhookEvent): Promise<void> {
    const pool = getPool()
    const productId = event.data?.id

    if (!productId) {
      console.warn("⚠️ ID do produto não encontrado no evento")
      return
    }

    try {
      switch (event.ocorrencia) {
        case "incluido":
        case "alterado":
          // Busca produto atualizado da API e salva no banco
          console.log(`🔄 Sincronizando produto ${productId}`)
          // TODO: Implementar sincronização do produto
          break

        case "excluido":
          // Remove produto do banco local
          await pool.query("DELETE FROM bling_produtos WHERE bling_id = $1", [productId])
          console.log(`🗑️ Produto ${productId} removido`)
          break
      }
    } catch (error) {
      console.error(`❌ Erro ao processar evento de produto ${productId}:`, error)
      throw error
    }
  }

  /**
   * Processa evento de pedido
   */
  private static async processOrderEvent(event: BlingWebhookEvent): Promise<void> {
    const pool = getPool()
    const orderId = event.data?.id

    if (!orderId) {
      console.warn("⚠️ ID do pedido não encontrado no evento")
      return
    }

    try {
      switch (event.ocorrencia) {
        case "incluido":
        case "alterado":
          // Busca pedido atualizado da API e salva no banco
          console.log(`🔄 Sincronizando pedido ${orderId}`)
          // TODO: Implementar sincronização do pedido
          break

        case "excluido":
          // Remove pedido do banco local
          await pool.query("DELETE FROM bling_pedidos WHERE bling_id = $1", [orderId])
          console.log(`🗑️ Pedido ${orderId} removido`)
          break
      }
    } catch (error) {
      console.error(`❌ Erro ao processar evento de pedido ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Processa evento de estoque
   */
  private static async processStockEvent(event: BlingWebhookEvent): Promise<void> {
    const pool = getPool()
    const productId = event.data?.produto?.id
    const depositId = event.data?.deposito?.id

    if (!productId) {
      console.warn("⚠️ ID do produto não encontrado no evento de estoque")
      return
    }

    try {
      switch (event.ocorrencia) {
        case "incluido":
        case "alterado":
          // Atualiza saldo de estoque
          console.log(`🔄 Atualizando estoque do produto ${productId}`)
          // TODO: Implementar atualização de estoque
          break
      }
    } catch (error) {
      console.error(`❌ Erro ao processar evento de estoque:`, error)
      throw error
    }
  }

  /**
   * Processa evento de contato
   */
  private static async processContactEvent(event: BlingWebhookEvent): Promise<void> {
    const pool = getPool()
    const contactId = event.data?.id

    if (!contactId) {
      console.warn("⚠️ ID do contato não encontrado no evento")
      return
    }

    try {
      switch (event.ocorrencia) {
        case "incluido":
        case "alterado":
          // Busca contato atualizado da API e salva no banco
          console.log(`🔄 Sincronizando contato ${contactId}`)
          // TODO: Implementar sincronização do contato
          break

        case "excluido":
          // Remove contato do banco local
          await pool.query("DELETE FROM bling_contatos WHERE bling_id = $1", [contactId])
          console.log(`🗑️ Contato ${contactId} removido`)
          break
      }
    } catch (error) {
      console.error(`❌ Erro ao processar evento de contato ${contactId}:`, error)
      throw error
    }
  }

  /**
   * Obtém estatísticas de webhooks
   */
  static async getWebhookStats(): Promise<{
    total: number
    processados: number
    pendentes: number
    erros: number
    ultimoEvento?: Date
  }> {
    const pool = getPool()

    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE processado = true) as processados,
          COUNT(*) FILTER (WHERE processado = false AND erro IS NULL) as pendentes,
          COUNT(*) FILTER (WHERE erro IS NOT NULL) as erros,
          MAX(data_evento) as ultimo_evento
        FROM bling_webhook_logs
      `)

      const row = result.rows[0]
      return {
        total: Number.parseInt(row.total) || 0,
        processados: Number.parseInt(row.processados) || 0,
        pendentes: Number.parseInt(row.pendentes) || 0,
        erros: Number.parseInt(row.erros) || 0,
        ultimoEvento: row.ultimo_evento ? new Date(row.ultimo_evento) : undefined,
      }
    } catch (error) {
      console.error("❌ Erro ao obter estatísticas de webhooks:", error)
      return {
        total: 0,
        processados: 0,
        pendentes: 0,
        erros: 0,
      }
    }
  }

  /**
   * Reprocessa webhooks com erro
   */
  static async retryFailedWebhooks(): Promise<number> {
    const pool = getPool()

    try {
      const result = await pool.query(`
        SELECT evento, ocorrencia, data_evento, payload
        FROM bling_webhook_logs
        WHERE erro IS NOT NULL AND processado = false
        ORDER BY data_evento DESC
        LIMIT 10
      `)

      let reprocessed = 0

      for (const row of result.rows) {
        try {
          const event: BlingWebhookEvent = JSON.parse(row.payload)
          await this.processWebhookEvent(event)
          reprocessed++
        } catch (error) {
          console.error(`❌ Erro ao reprocessar webhook:`, error)
        }
      }

      console.log(`✅ ${reprocessed} webhooks reprocessados`)
      return reprocessed
    } catch (error) {
      console.error("❌ Erro ao reprocessar webhooks:", error)
      return 0
    }
  }
}
