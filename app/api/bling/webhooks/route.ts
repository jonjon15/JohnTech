import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")

    // Validar assinatura do webhook (segurança)
    if (!validateWebhookSignature(body, signature)) {
      console.error("Assinatura do webhook inválida")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    console.log("Webhook recebido:", webhookData)

    // Processar webhook baseado no tipo de evento
    await processWebhookEvent(webhookData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

function validateWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) return false

  const webhookSecret = process.env.BLING_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn("BLING_WEBHOOK_SECRET não configurado")
    return true // Em desenvolvimento, pode pular validação
  }

  const expectedSignature = createHmac("sha256", webhookSecret).update(body).digest("hex")

  return signature === `sha256=${expectedSignature}`
}

async function processWebhookEvent(data: any) {
  const { evento, dados, ocorrencia } = data

  switch (evento) {
    case "produto.criado":
      await handleProdutoCriado(dados)
      break

    case "produto.alterado":
      await handleProdutoAlterado(dados)
      break

    case "produto.excluido":
      await handleProdutoExcluido(dados)
      break

    case "estoque.alterado":
      await handleEstoqueAlterado(dados)
      break

    case "pedido.criado":
      await handlePedidoCriado(dados)
      break

    case "pedido.alterado":
      await handlePedidoAlterado(dados)
      break

    case "nfe.autorizada":
      await handleNfeAutorizada(dados)
      break

    case "nfe.cancelada":
      await handleNfeCancelada(dados)
      break

    default:
      console.log(`Evento não tratado: ${evento}`)
  }
}

async function handleProdutoCriado(dados: any) {
  console.log("Produto criado:", dados)
  // Implementar lógica para sincronizar produto criado
}

async function handleProdutoAlterado(dados: any) {
  console.log("Produto alterado:", dados)
  // Implementar lógica para sincronizar alterações do produto
}

async function handleProdutoExcluido(dados: any) {
  console.log("Produto excluído:", dados)
  // Implementar lógica para remover produto do sistema local
}

async function handleEstoqueAlterado(dados: any) {
  console.log("Estoque alterado:", dados)
  // Implementar lógica para sincronizar alterações de estoque
}

async function handlePedidoCriado(dados: any) {
  console.log("Pedido criado:", dados)
  // Implementar lógica para processar novo pedido
}

async function handlePedidoAlterado(dados: any) {
  console.log("Pedido alterado:", dados)
  // Implementar lógica para sincronizar alterações do pedido
}

async function handleNfeAutorizada(dados: any) {
  console.log("NFe autorizada:", dados)
  // Implementar lógica para processar NFe autorizada
}

async function handleNfeCancelada(dados: any) {
  console.log("NFe cancelada:", dados)
  // Implementar lógica para processar NFe cancelada
}
