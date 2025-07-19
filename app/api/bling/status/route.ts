import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { testConnection } from "@/lib/db"

const userEmail = process.env.BLING_USER_EMAIL || "admin@johntech.com"

export async function GET() {
  try {
    const dbStatus = await testConnection()
    const accessToken = await getValidAccessToken(userEmail)

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbStatus.success,
        timestamp: dbStatus.timestamp,
        error: dbStatus.error,
      },
      bling: {
        authenticated: !!accessToken,
        userEmail: userEmail,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasClientId: !!process.env.BLING_CLIENT_ID,
        hasClientSecret: !!process.env.BLING_CLIENT_SECRET,
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        hasWebhookSecret: !!process.env.BLING_WEBHOOK_SECRET,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
