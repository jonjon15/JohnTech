
import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { createProduct, updateProduct, removeProduct } from "@/lib/db"

// Armazenamento simples em memória para logs de webhooks recebidos
let webhookLogs: any[] = []

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

    // Salva log do webhook recebido
    webhookLogs.unshift({
      receivedAt: new Date().toISOString(),
      evento: webhookData.evento,
      dados: webhookData.dados,
      raw: webhookData,
    })
    webhookLogs = webhookLogs.slice(0, 50) // Limita a 50 logs

    // Processar webhook baseado no tipo de evento
    await processWebhookEvent(webhookData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Endpoint GET para consultar os últimos webhooks recebidos
export async function GET() {
  return NextResponse.json({ logs: webhookLogs })
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


// Cria produto no banco ao receber webhook
async function handleProdutoCriado(dados: any) {
  try {
    await createProduct({
      nome: dados.nome ?? "Produto Webhook",
      codigo: dados.codigo ?? "",
      preco: dados.preco ?? 0,
      descricao_curta: dados.descricao_curta ?? null,
      situacao: dados.situacao ?? "Ativo",
      tipo: dados.tipo ?? "P",
      formato: dados.formato ?? "S",
      bling_id: dados.bling_id ?? null,
    })
    console.log("Produto criado via webhook:", dados)
  } catch (e) {
    console.error("Erro ao criar produto via webhook:", e)
  }
}


// Atualiza produto no banco ao receber webhook
async function handleProdutoAlterado(dados: any) {
  try {
    if (!dados.id) return
    await updateProduct(Number(dados.id), dados)
    console.log("Produto alterado via webhook:", dados)
  } catch (e) {
    console.error("Erro ao atualizar produto via webhook:", e)
  }
}


// Remove produto do banco ao receber webhook
async function handleProdutoExcluido(dados: any) {
  try {
    if (!dados.id) return
    await removeProduct(Number(dados.id))
    console.log("Produto excluído via webhook:", dados)
  } catch (e) {
    console.error("Erro ao remover produto via webhook:", e)
  }
}


// Atualiza estoque do produto (exemplo simplificado)
async function handleEstoqueAlterado(dados: any) {
  try {
    if (!dados.id || dados.estoque == null) return
    await updateProduct(Number(dados.id), { estoque: dados.estoque })
    console.log("Estoque alterado via webhook:", dados)
  } catch (e) {
    console.error("Erro ao atualizar estoque via webhook:", e)
  }
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
