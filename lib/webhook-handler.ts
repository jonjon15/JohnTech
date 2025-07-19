/**
 * Handler avançado para webhooks do Bling
 * Baseado na documentação: https://developer.bling.com.br/webhooks
 */

import crypto from "crypto"

export interface WebhookEvent {
  event: string
  data: any
  timestamp: string
  signature: string
}

export class BlingWebhookHandler {
  private secret: string
  private handlers: Map<string, (data: any) => Promise<void>> = new Map()

  constructor(secret: string) {
    this.secret = secret
  }

  // Validar assinatura do webhook
  validateSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto.createHmac("sha256", this.secret).update(payload).digest("hex")

    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  }

  // Registrar handler para evento
  on(event: string, handler: (data: any) => Promise<void>) {
    this.handlers.set(event, handler)
  }

  // Processar webhook
  async process(event: WebhookEvent): Promise<void> {
    const handler = this.handlers.get(event.event)
    if (handler) {
      await handler(event.data)
    } else {
      console.warn(`No handler registered for event: ${event.event}`)
    }
  }

  // Handlers padrão
  setupDefaultHandlers() {
    // Produto criado
    this.on("produto.criado", async (data) => {
      console.log("Produto criado:", data)
      // Sincronizar com banco local
    })

    // Produto atualizado
    this.on("produto.atualizado", async (data) => {
      console.log("Produto atualizado:", data)
      // Atualizar banco local
    })

    // Produto excluído
    this.on("produto.excluido", async (data) => {
      console.log("Produto excluído:", data)
      // Remover do banco local
    })

    // Estoque atualizado
    this.on("estoque.atualizado", async (data) => {
      console.log("Estoque atualizado:", data)
      // Sincronizar estoque
    })

    // Pedido criado
    this.on("pedido.criado", async (data) => {
      console.log("Pedido criado:", data)
      // Processar novo pedido
    })

    // NFe autorizada
    this.on("nfe.autorizada", async (data) => {
      console.log("NFe autorizada:", data)
      // Atualizar status do pedido
    })
  }
}

// Handler simples para exportações do sistema
export async function handleWebhookEvent(secret: string, rawBody: string, signature: string) {
  const handler = new BlingWebhookHandler(secret)
  handler.setupDefaultHandlers()
  if (!handler.validateSignature(rawBody, signature)) {
    throw new Error("Assinatura inválida")
  }
  const event: WebhookEvent = JSON.parse(rawBody)
  await handler.process(event)
}
