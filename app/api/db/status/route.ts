import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const connected = await checkDatabaseConnection()

    return NextResponse.json({
      success: true,
      connected,
      timestamp: new Date().toISOString(),
      database: "PostgreSQL (Vercel)",
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do banco:", error)

    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
