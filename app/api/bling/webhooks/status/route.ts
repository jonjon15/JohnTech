import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/bling/webhooks/status - Verificando status dos webhooks...")

    // Verificar se a tabela de webhooks existe
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'bling_webhook_events'
    `

    if (tableCheck.rows.length === 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "TABLE_NOT_FOUND",
          message: 'Tabela "bling_webhook_events" não existe. Execute o script SQL primeiro.',
          statusCode: 500,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Buscar estatísticas dos webhooks
    const stats = await sql`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE processed = true) as processed_events,
        COUNT(*) FILTER (WHERE processed = false) as pending_events,
        COUNT(*) FILTER (WHERE error_message IS NOT NULL) as error_events,
        MAX(received_at) as last_event_at
      FROM bling_webhook_events
    `

    // Buscar eventos recentes
    const recentEvents = await sql`
      SELECT event_type, processed, error_message, received_at
      FROM bling_webhook_events
      ORDER BY received_at DESC
      LIMIT 10
    `

    // Buscar tipos de eventos
    const eventTypes = await sql`
      SELECT event_type, COUNT(*) as count
      FROM bling_webhook_events
      GROUP BY event_type
      ORDER BY count DESC
    `

    const webhookData = {
      table_exists: true,
      statistics: stats.rows[0],
      recent_events: recentEvents.rows,
      event_types: eventTypes.rows,
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/bling/webhooks`,
      webhook_secret_configured: !!process.env.BLING_WEBHOOK_SECRET,
    }

    console.log(`✅ Status webhooks: ${stats.rows[0].total_events} eventos total`)

    return NextResponse.json(createBlingApiResponse(true, webhookData), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("❌ Erro ao verificar status dos webhooks:", error)

    const blingError = handleBlingApiError(error, "webhooks-status")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
