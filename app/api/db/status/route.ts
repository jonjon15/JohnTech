import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/db/status - Verificando status do banco...")

    // Teste básico de conexão
    const connectionTest = await sql`SELECT NOW() as current_time, version() as db_version`

    // Verificar tabelas existentes
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'bling_%'
      ORDER BY table_name
    `

    // Contar registros em cada tabela
    const tableCounts = []
    for (const table of tablesCheck.rows) {
      try {
        const countResult = await sql.query(`SELECT COUNT(*) as count FROM ${table.table_name}`)
        tableCounts.push({
          table: table.table_name,
          count: Number.parseInt(countResult.rows[0].count),
        })
      } catch (error) {
        tableCounts.push({
          table: table.table_name,
          count: 0,
          error: "Erro ao contar registros",
        })
      }
    }

    const dbData = {
      connection_ok: true,
      current_time: connectionTest.rows[0].current_time,
      database_version: connectionTest.rows[0].db_version,
      tables: tablesCheck.rows.map((row) => row.table_name),
      table_counts: tableCounts,
      required_tables: ["bling_auth_tokens", "bling_products", "bling_webhook_events", "bling_api_logs"],
      missing_tables: ["bling_auth_tokens", "bling_products", "bling_webhook_events", "bling_api_logs"].filter(
        (table) => !tablesCheck.rows.some((row) => row.table_name === table),
      ),
    }

    console.log(`✅ Banco conectado: ${tablesCheck.rows.length} tabelas Bling encontradas`)

    return NextResponse.json(createBlingApiResponse(true, dbData), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("❌ Erro ao verificar status do banco:", error)

    const blingError = handleBlingApiError(error, "database-status")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
