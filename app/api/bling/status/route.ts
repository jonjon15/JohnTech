import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET
    const databaseUrl = process.env.DATABASE_URL

    // Testa conectividade com a API do Bling
    let blingApiStatus = "unknown"
    try {
      const response = await fetch("https://www.bling.com.br/Api/v3/oauth/authorize", {
        method: "HEAD",
        timeout: 5000,
      })
      blingApiStatus = response.ok ? "online" : "degraded"
    } catch (error) {
      blingApiStatus = "offline"
    }

    return NextResponse.json({
      status: "online",
      timestamp: new Date().toISOString(),
      services: {
        bling_api: {
          status: blingApiStatus,
          configured: !!(clientId && clientSecret),
        },
        database: {
          status: databaseUrl ? "configured" : "missing",
          configured: !!databaseUrl,
        },
        webhooks: {
          status: webhookSecret ? "configured" : "missing",
          configured: !!webhookSecret,
        },
      },
      environment: {
        has_client_id: !!clientId,
        has_client_secret: !!clientSecret,
        has_webhook_secret: !!webhookSecret,
        has_database_url: !!databaseUrl,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Falha ao verificar status dos serviços",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
