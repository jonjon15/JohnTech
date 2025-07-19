import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    const status = {
      client_id_configured: !!clientId,
      client_secret_configured: !!clientSecret,
      base_url_configured: !!baseUrl,
      callback_url: baseUrl ? `${baseUrl}/auth/callback` : "URL base não configurada",
      timestamp: new Date().toISOString(),
    }

    const allConfigured = status.client_id_configured && status.client_secret_configured && status.base_url_configured

    return NextResponse.json({
      status: allConfigured ? "ok" : "error",
      message: allConfigured ? "OAuth configurado corretamente" : "Configuração OAuth incompleta",
      ...status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar status OAuth",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
