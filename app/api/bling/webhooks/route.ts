import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import crypto from "crypto"

// Verificar assinatura do webhook
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")
    const eventType = request.headers.get("x-bling-event")

    // Verificar se é um webhook válido
    if (!signature || !eventType) {
      return NextResponse.json({ error: "Headers de webhook ausentes" }, { status: 400 })
    }

    // Verificar assinatura (se configurado)
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
    }

    const eventData = JSON.parse(body)

    // Salvar evento no banco
    await sql`
      INSERT INTO bling_webhook_events (event_type, event_data, received_at)
      VALUES (${eventType}, ${JSON.stringify(eventData)}, NOW())
    `

    // Processar evento baseado no tipo
    await processWebhookEvent(eventType, eventData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

async function processWebhookEvent(eventType: string, eventData: any) {
  try {
    switch (eventType) {
      case "produto.criado":
      case "produto.atualizado":
        await processProductEvent(eventData)
        break

      case "produto.removido":
        await processProductRemoval(eventData)
        break

      case "pedido.criado":
      case "pedido.atualizado":
        await processOrderEvent(eventData)
        break

      case "estoque.atualizado":
        await processStockEvent(eventData)
        break

      default:
        console.log(`Evento não processado: ${eventType}`)
    }

    // Marcar evento como processado
    await sql`
      UPDATE bling_webhook_events 
      SET processed = true, processed_at = NOW()
      WHERE event_type = ${eventType} 
      AND event_data = ${JSON.stringify(eventData)}
      AND processed = false
    `
  } catch (error) {
    console.error(`Erro ao processar evento ${eventType}:`, error)

    // Salvar erro no banco
    await sql`
      UPDATE bling_webhook_events 
      SET error_message = ${error instanceof Error ? error.message : "Erro desconhecido"}
      WHERE event_type = ${eventType} 
      AND event_data = ${JSON.stringify(eventData)}
      AND processed = false
    `
  }
}

async function processProductEvent(eventData: any) {
  const produto = eventData.produto || eventData

  // Verificar se produto já existe
  const existingProduct = await sql`
    SELECT id FROM bling_products WHERE bling_id = ${produto.id}
  `

  if (existingProduct.rows.length > 0) {
    // Atualizar produto existente
    await sql`
      UPDATE bling_products 
      SET 
        nome = ${produto.nome},
        codigo = ${produto.codigo},
        preco = ${produto.preco || 0},
        descricao = ${produto.descricao || ""},
        situacao = ${produto.situacao || "Ativo"},
        updated_at = NOW()
      WHERE bling_id = ${produto.id}
    `
  } else {
    // Criar novo produto
    await sql`
      INSERT INTO bling_products (bling_id, nome, codigo, preco, descricao, situacao)
      VALUES (
        ${produto.id},
        ${produto.nome},
        ${produto.codigo},
        ${produto.preco || 0},
        ${produto.descricao || ""},
        ${produto.situacao || "Ativo"}
      )
    `
  }
}

async function processProductRemoval(eventData: any) {
  const produto = eventData.produto || eventData

  await sql`
    DELETE FROM bling_products WHERE bling_id = ${produto.id}
  `
}

async function processOrderEvent(eventData: any) {
  // Implementar processamento de pedidos se necessário
  console.log("Processando evento de pedido:", eventData)
}

async function processStockEvent(eventData: any) {
  // Implementar processamento de estoque se necessário
  console.log("Processando evento de estoque:", eventData)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const eventType = searchParams.get("event_type")

    const query = `
      SELECT * FROM bling_webhook_events
      ${eventType ? `WHERE event_type = '${eventType}'` : ""}
      ORDER BY received_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await sql.query(query)

    return NextResponse.json({
      events: result.rows,
      total: result.rowCount,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Erro ao buscar eventos de webhook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
