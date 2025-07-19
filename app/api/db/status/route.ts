import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("=== VERIFICANDO STATUS DO BANCO ===")

    const status = {
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        version: null,
        tables: [],
        error: null,
      },
      tables_info: {
        bling_tokens: {
          exists: false,
          count: 0,
          structure: null,
        },
        bling_webhook_logs: {
          exists: false,
          count: 0,
          structure: null,
        },
      },
    }

    // Testar conexão básica
    try {
      const versionResult = await sql`SELECT version() as version`
      status.database.connected = true
      status.database.version = versionResult.rows[0].version
    } catch (error) {
      status.database.error = (error as Error).message
      return NextResponse.json(status, { status: 500 })
    }

    // Verificar tabelas existentes
    try {
      const tablesResult = await sql`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('bling_tokens', 'bling_webhook_logs')
        ORDER BY table_name
      `

      status.database.tables = tablesResult.rows.map((row) => ({
        name: row.table_name,
        type: row.table_type,
      }))

      // Verificar tabela bling_tokens
      try {
        const tokenCount = await sql`SELECT COUNT(*) as count FROM bling_tokens`
        const tokenStructure = await sql`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'bling_tokens' 
          ORDER BY ordinal_position
        `

        status.tables_info.bling_tokens.exists = true
        status.tables_info.bling_tokens.count = Number.parseInt(tokenCount.rows[0].count)
        status.tables_info.bling_tokens.structure = tokenStructure.rows
      } catch (error) {
        console.log("Tabela bling_tokens não existe ou erro:", (error as Error).message)
      }

      // Verificar tabela bling_webhook_logs
      try {
        const webhookCount = await sql`SELECT COUNT(*) as count FROM bling_webhook_logs`
        const webhookStructure = await sql`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'bling_webhook_logs' 
          ORDER BY ordinal_position
        `

        status.tables_info.bling_webhook_logs.exists = true
        status.tables_info.bling_webhook_logs.count = Number.parseInt(webhookCount.rows[0].count)
        status.tables_info.bling_webhook_logs.structure = webhookStructure.rows
      } catch (error) {
        console.log("Tabela bling_webhook_logs não existe ou erro:", (error as Error).message)
      }
    } catch (error) {
      console.error("Erro ao verificar tabelas:", error)
      status.database.error = (error as Error).message
    }

    console.log("Status do banco:", status)

    return NextResponse.json(status)
  } catch (error: any) {
    console.error("=== ERRO NO STATUS DO BANCO ===")
    console.error("Erro:", error)

    return NextResponse.json(
      {
        error: "Erro ao verificar status do banco",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
