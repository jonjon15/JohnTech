import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"
import crypto from "crypto"

// Verificar assinatura do webhook conforme documentação
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex")
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-bling-signature")
    const eventType = request.headers.get("x-bling-event")

    console.log("📡 Webhook recebido:", { eventType, hasSignature: !!signature })

    // Verificar headers obrigatórios
    if (!eventType) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "MISSING_EVENT_TYPE",
          message: "Header x-bling-event é obrigatório",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Verificar assinatura se configurada
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        return NextResponse.json(
          createBlingApiResponse(false, null, {
            code: "INVALID_SIGNATURE",
            message: "Assinatura do webhook inválida",
            statusCode: 401,
          }),
          { status: 401 },
        )
      }
    }

    let eventData
    try {
      eventData = JSON.parse(body)
    } catch (error) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "INVALID_JSON",
          message: "Payload JSON inválido",
          statusCode: 400,
        }),
        { status: 400 },
      )
    }

    // Salvar evento no banco para auditoria
    const eventResult = await sql`
      INSERT INTO bling_webhook_events (event_type, event_data, received_at)
      VALUES (${eventType}, ${JSON.stringify(eventData)}, NOW())
      RETURNING id
    `

    const eventId = eventResult.rows[0].id

    // Processar evento baseado no tipo
    let processed = false
    let errorMessage = null

    try {
      switch (eventType) {
        case "produto.criado":
        case "produto.atualizado":
          await processProductEvent(eventData)
          processed = true
          break

        case "produto.removido":
          await processProductRemoval(eventData)
          processed = true
          break

        case "pedido.criado":
        case "pedido.atualizado":
          await processOrderEvent(eventData)
          processed = true
          break

        case "estoque.atualizado":
          await processStockEvent(eventData)
          processed = true
          break

        case "nfe.autorizada":
        case "nfe.cancelada":
          await processNfeEvent(eventData)
          processed = true
          break

        default:
          console.log(`ℹ️ Tipo de evento não processado: ${eventType}`)
          processed = false
      }
    } catch (processingError: any) {
      errorMessage = processingError.message
      console.error(`❌ Erro ao processar evento ${eventType}:`, processingError)
    }

    // Atualizar status do processamento
    await sql`
      UPDATE bling_webhook_events 
      SET processed = ${processed}, 
          error_message = ${errorMessage},
          processed_at = NOW()
      WHERE id = ${eventId}
    `

    return NextResponse.json(
      createBlingApiResponse(true, {
        event_id: eventId,
        event_type: eventType,
        processed: processed,
        message: processed ? "Evento processado com sucesso" : "Evento recebido mas não processado",
      }),
      { status: 200 },
    )
  } catch (error: any) {
    console.error("❌ Erro ao processar webhook:", error)
    const blingError = handleBlingApiError(error, "webhook-processing")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const eventType = searchParams.get("event_type")

    // Buscar eventos com paginação
    const whereClause = eventType ? `WHERE event_type = '${eventType}'` : ""
    const events = await sql.query(`
      SELECT * FROM bling_webhook_events
      ${whereClause}
      ORDER BY received_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

    // Contar total
    const countResult = await sql.query(`
      SELECT COUNT(*) as total FROM bling_webhook_events
      ${whereClause}
    `)

    const total = Number.parseInt(countResult.rows[0].total)

    return NextResponse.json(
      createBlingApiResponse(true, {
        events: events.rows,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total,
        },
      }),
    )
  } catch (error: any) {
    console.error("❌ Erro ao listar webhooks:", error)
    const blingError = handleBlingApiError(error, "list-webhooks")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
    })
  }
}

// Funções de processamento de eventos
async function processProductEvent(eventData: any) {
  const produto = eventData.produto || eventData.data

  if (!produto || !produto.id) {
    throw new Error("Dados do produto inválidos")
  }

  // Verificar se produto já existe
  const existing = await sql`
    SELECT id FROM bling_products WHERE bling_id = ${produto.id}
  `

  if (existing.rows.length > 0) {
    // Atualizar produto existente
    await sql`
      UPDATE bling_products 
      SET nome = ${produto.nome}, 
          codigo = ${produto.codigo || ""},
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
      VALUES (${produto.id}, ${produto.nome}, ${produto.codigo || ""}, ${produto.preco || 0}, ${produto.descricao || ""}, ${produto.situacao || "Ativo"})
    `
  }
}

async function processProductRemoval(eventData: any) {
  const produto = eventData.produto || eventData.data

  if (produto?.id) {
    await sql`
      DELETE FROM bling_products WHERE bling_id = ${produto.id}
    `
  }
}

async function processOrderEvent(eventData: any) {
  const pedido = eventData.pedido || eventData.data
  console.log("📦 Processando pedido:", pedido?.numero || "N/A")
  // Implementar lógica de pedidos conforme necessário
}

async function processStockEvent(eventData: any) {
  const estoque = eventData.estoque || eventData.data
  console.log("📊 Processando estoque:", estoque?.produto_id || "N/A")
  // Implementar lógica de estoque conforme necessário
}

async function processNfeEvent(eventData: any) {
  const nfe = eventData.nfe || eventData.data
  console.log("📄 Processando NFe:", nfe?.numero || "N/A")
  // Implementar lógica de NFe conforme necessário
}
