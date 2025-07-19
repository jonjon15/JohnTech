import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      return NextResponse.json(
        {
          status: "error",
          message: "DATABASE_URL não configurada",
        },
        { status: 500 },
      )
    }

    // Teste de conexão simples
    const result = await sql`SELECT NOW() as current_time`

    return NextResponse.json({
      status: "ok",
      message: "Banco de dados conectado",
      current_time: result.rows[0]?.current_time,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro de conexão com banco de dados",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
