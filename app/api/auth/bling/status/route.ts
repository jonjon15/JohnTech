import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          status: "misconfigured",
          message: "Client ID ou Client Secret não configurados",
          configured: false,
        },
        { status: 500 },
      )
    }

    // Testa se as URLs estão corretas
    const redirectUri = `${baseUrl}/auth/callback`

    return NextResponse.json({
      status: "configured",
      message: "Autenticação OAuth configurada corretamente",
      configured: true,
      config: {
        client_id: clientId.substring(0, 8) + "...", // Mostra apenas parte do ID
        redirect_uri: redirectUri,
        base_url: baseUrl,
      },
      responseTime: Date.now(),
    })
  } catch (error) {
    console.error("Erro ao verificar status da autenticação:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar configuração OAuth",
        configured: false,
      },
      { status: 500 },
    )
  }
}
