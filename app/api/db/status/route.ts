import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Testa conexão com o banco
    const result = await sql`SELECT NOW() as current_time, version() as db_version`

    if (result.length > 0) {
      return NextResponse.json({
        status: "online",
        message: "Banco de dados conectado",
        database: {
          connected: true,
          timestamp: result[0].current_time,
          version: result[0].db_version,
        },
        responseTime: Date.now(),
      })
    } else {
      throw new Error("Nenhum resultado retornado")
    }
  } catch (error) {
    console.error("Erro na conexão com o banco:", error)
    return NextResponse.json(
      {
        status: "offline",
        message: "Falha na conexão com o banco de dados",
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
      { status: 503 },
    )
  }
}
