import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    const status = {
      bling: {
        configured: !!(clientId && clientSecret),
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasWebhookSecret: !!webhookSecret,
        baseUrl: baseUrl,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Erro ao verificar status do Bling:", error)
    return NextResponse.json({ error: "Falha ao verificar status" }, { status: 500 })
  }
}
