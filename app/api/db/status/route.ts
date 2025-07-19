import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as current_time`

    return NextResponse.json({
      status: "connected",
      message: "Banco de dados conectado",
      timestamp: result.rows[0].current_time,
    })
  } catch (error) {
    console.error("Erro de conexão com banco:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Falha na conexão com banco de dados",
      },
      { status: 500 },
    )
  }
}
