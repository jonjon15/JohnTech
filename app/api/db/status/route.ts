import { NextResponse } from "next/server"
import { testConnection, createTablesIfNotExists } from "@/lib/db"

export async function GET() {
  try {
    const connectionTest = await testConnection()

    if (connectionTest.success) {
      await createTablesIfNotExists()
    }

    return NextResponse.json({
      database: {
        connected: connectionTest.success,
        timestamp: connectionTest.timestamp,
        error: connectionTest.error,
      },
      tables: {
        created: connectionTest.success,
      },
      environment: {
        databaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Database status check failed",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
