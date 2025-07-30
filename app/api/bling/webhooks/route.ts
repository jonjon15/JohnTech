

import { type NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { createProduct, updateProduct, removeProduct, sql } from "@/lib/db"
import * as Sentry from "@sentry/nextjs"

// Armazenamento simples em memória para logs de webhooks recebidos
let webhookLogs: any[] = []

export async function POST(request: NextRequest) {
  const { rateLimit } = await import("@/lib/bling-rate-limit")
  await rateLimit("bling_webhooks")
  try {
    // Recebe o corpo como texto (obrigatório para validação HMAC)
    const body = await request.text();
    const signature = request.headers.get("x-bling-signature-256");

    // Validação da assinatura HMAC
    if (!validateWebhookSignature(body, signature)) {
      console.error("Assinatura do webhook inválida");
      // Sempre responder 2xx para evitar retentativas desnecessárias, mas logar o erro
      return NextResponse.json({ error: "Unauthorized" }, { status: 200 });
    }

    // Parse do payload conforme padrão Bling
    const webhookData = JSON.parse(body);
    console.log("Webhook recebido:", webhookData);

    // Log do webhook recebido (mantém últimos 50)
    webhookLogs.unshift({
      receivedAt: new Date().toISOString(),
      event: webhookData.event,
      companyId: webhookData.companyId,
      eventId: webhookData.eventId,
      data: webhookData.data,
      raw: webhookData,
    });
    webhookLogs = webhookLogs.slice(0, 50);

    // Idempotência: persistir eventId para evitar duplicidade
    if (webhookData.eventId) {
      const exists = await sql`SELECT 1 FROM webhook_events WHERE event_data->>'eventId' = ${webhookData.eventId} LIMIT 1`;
      if (exists.rows.length > 0) {
        console.warn("Webhook duplicado ignorado (eventId já processado):", webhookData.eventId);
        return NextResponse.json({ success: true, duplicate: true });
      }
      // Persiste o evento para rastreio e idempotência
      await sql`
        INSERT INTO webhook_events (user_id, event_type, event_data, processed, created_at)
        VALUES (NULL, ${webhookData.event}, ${JSON.stringify(webhookData)}, TRUE, NOW())
      `;
    }

    // Processar evento conforme documentação Bling
    await processBlingWebhookEvent(webhookData);

    // Sempre responder 2xx em até 5s
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    Sentry.captureException(error);
    // Persistir erro para rastreabilidade
    try {
      await sql`
        INSERT INTO webhook_events (user_id, event_type, event_data, processed, error_message, created_at)
        VALUES (NULL, 'webhook_error', ${JSON.stringify({ error: String(error) })}, FALSE, ${String(error)}, NOW())
      `;
    } catch (persistErr) {
      console.error("Falha ao registrar erro de webhook no banco:", persistErr);
      Sentry.captureException(persistErr);
    }
    // Sempre responder 2xx para evitar retentativas, mas logar o erro
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 200 });
  }
}

// Endpoint GET para consultar os últimos webhooks recebidos
export async function GET() {
  return NextResponse.json({ logs: webhookLogs });
}

function validateWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  const webhookSecret = process.env.BLING_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("BLING_WEBHOOK_SECRET não configurado");
    return true; // Em dev, pode pular validação
  }
  const expected = createHmac("sha256", webhookSecret).update(body, "utf8").digest("hex");
  // O header vem como sha256=...
  const expectedHeader = `sha256=${expected}`;
  // Comparação segura
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHeader));
  } catch {
    return false;
  }
}

// Processa eventos conforme padrão Bling (event: resource.action)
async function processBlingWebhookEvent(data: any) {
  const { event, data: payload } = data;
  if (!event) return;
  const [resource, action] = event.split(".");
  switch (`${resource}.${action}`) {
    case "product.created":
      await handleProdutoCriado(payload);
      break;
    case "product.updated":
      await handleProdutoAlterado(payload);
      break;
    case "product.deleted":
      await handleProdutoExcluido(payload);
      break;
    case "stock.updated":
      await handleEstoqueAlterado(payload);
      break;
    case "order.created":
      await handlePedidoCriado(payload);
      break;
    case "order.updated":
      await handlePedidoAlterado(payload);
      break;
    case "invoice.created":
      await handleNfeAutorizada(payload);
      break;
    case "invoice.deleted":
      await handleNfeCancelada(payload);
      break;
    default:
      console.log(`Evento não tratado: ${event}`);
  }
}


// Cria produto no banco ao receber webhook
async function handleProdutoCriado(dados: any) {
  try {
    await createProduct({
      nome: dados.nome ?? "Produto Webhook",
      codigo: dados.codigo ?? "",
      preco: dados.preco ?? 0,
      descricao_curta: dados.descricaoCurta ?? null,
      situacao: dados.situacao ?? "A",
      tipo: dados.tipo ?? "P",
      formato: dados.formato ?? "S",
      bling_id: dados.id ?? null,
      estoque: dados.estoque ?? null,
    });
    console.log("Produto criado via webhook:", dados);
  } catch (e) {
    console.error("Erro ao criar produto via webhook:", e);
  }
}


// Atualiza produto no banco ao receber webhook
async function handleProdutoAlterado(dados: any) {
  try {
    if (!dados.id) return;
    await updateProduct(Number(dados.id), dados);
    console.log("Produto alterado via webhook:", dados);
  } catch (e) {
    console.error("Erro ao atualizar produto via webhook:", e);
  }
}


// Remove produto do banco ao receber webhook
async function handleProdutoExcluido(dados: any) {
  try {
    if (!dados.id) return;
    await removeProduct(Number(dados.id));
    console.log("Produto excluído via webhook:", dados);
  } catch (e) {
    console.error("Erro ao remover produto via webhook:", e);
  }
}


// Atualiza estoque do produto (exemplo simplificado)
async function handleEstoqueAlterado(dados: any) {
  try {
    if (!dados.produto?.id || dados.deposito?.saldoFisico == null) return;
    await updateProduct(Number(dados.produto.id), { estoque: dados.deposito.saldoFisico });
    console.log("Estoque alterado via webhook:", dados);
  } catch (e) {
    console.error("Erro ao atualizar estoque via webhook:", e);
  }
}

async function handlePedidoCriado(dados: any) {
  console.log("Pedido criado:", dados);
  // Implementar lógica para processar novo pedido
}

async function handlePedidoAlterado(dados: any) {
  console.log("Pedido alterado:", dados);
  // Implementar lógica para sincronizar alterações do pedido
}

async function handleNfeAutorizada(dados: any) {
  console.log("NFe autorizada:", dados);
  // Implementar lógica para processar NFe autorizada
}

async function handleNfeCancelada(dados: any) {
  console.log("NFe cancelada:", dados);
  // Implementar lógica para processar NFe cancelada
}
