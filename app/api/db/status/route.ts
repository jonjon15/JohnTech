import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Teste básico de conexão
    const connectionTest = await sql`SELECT NOW() as current_time, version() as pg_version`

    // Verificar se tabela users existe e sua estrutura
    let tableInfo = null
    try {
      const tableCheck = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `
      tableInfo = tableCheck.rows
    } catch (error) {
      console.log("Erro ao verificar estrutura da tabela:", error)
    }

    // Contar registros na tabela users
    let userCount = 0
    try {
      const countResult = await sql`SELECT COUNT(*) as total FROM users`
      userCount = Number.parseInt(countResult.rows[0].total)
    } catch (error) {
      console.log("Erro ao contar usuários:", error)
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        current_time: connectionTest.rows[0].current_time,
        postgresql_version: connectionTest.rows[0].pg_version,
        database_url_configured: !!process.env.DATABASE_URL,
      },
      tables: {
        users: {
          exists: tableInfo !== null,
          columns: tableInfo,
          record_count: userCount,
        },
      },
    })
  } catch (error) {
    console.error("Database status check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          database_url_configured: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 },
    )
  }
}
