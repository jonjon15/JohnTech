import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          status: "error",
          message: "Credenciais do Bling não configuradas",
          configured: false,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ready",
      message: "Autenticação Bling configurada",
      configured: true,
      authUrl: `${baseUrl}/api/auth/bling`,
      callbackUrl: `${baseUrl}/auth/callback`,
    })
  } catch (error) {
    console.error("Erro ao verificar status da autenticação:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
