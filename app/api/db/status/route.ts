import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Testar conexão com o banco
    const result = await sql`SELECT NOW() as current_time`

    // Verificar se a tabela existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bling_tokens'
      ) as table_exists
    `

    // Contar tokens
    const tokenCount = await sql`SELECT COUNT(*) as count FROM bling_tokens`

    return NextResponse.json({
      status: "connected",
      database: {
        connected: true,
        currentTime: result.rows[0].current_time,
        tableExists: tableCheck.rows[0].table_exists,
        tokenCount: Number.parseInt(tokenCount.rows[0].count),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database: {
          connected: false,
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
