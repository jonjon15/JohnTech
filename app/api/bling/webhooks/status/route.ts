import { NextResponse } from "next/server"

export async function GET() {
  try {
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET
    const webhookUrl = process.env.NEXT_PUBLIC_BASE_URL + "/api/bling/webhooks"

    return NextResponse.json({
      configured: !!webhookSecret,
      url: webhookUrl,
      hasSecret: !!webhookSecret,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao verificar status dos webhooks:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Falha ao verificar status",
      },
      { status: 500 },
    )
  }
}
