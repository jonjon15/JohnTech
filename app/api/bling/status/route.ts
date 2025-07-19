import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Teste de conexão com banco
    const dbTest = await sql`SELECT NOW() as current_time`

    // Verificar variáveis de ambiente
    const envCheck = {
      BLING_CLIENT_ID: !!process.env.BLING_CLIENT_ID,
      BLING_CLIENT_SECRET: !!process.env.BLING_CLIENT_SECRET,
      BLING_API_URL: !!process.env.BLING_API_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
    }

    // Verificar se tabela users existe
    let tableExists = false
    try {
      await sql`SELECT 1 FROM users LIMIT 1`
      tableExists = true
    } catch (error) {
      console.log("Tabela users não existe ou erro:", error)
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        current_time: dbTest.rows[0].current_time,
        users_table_exists: tableExists,
      },
      environment: envCheck,
      bling: {
        api_url: process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3",
        client_id_configured: !!process.env.BLING_CLIENT_ID,
      },
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
