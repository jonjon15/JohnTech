import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET() {
  try {
    const userEmail = "admin@example.com"

    // Verificar variáveis de ambiente
    const envCheck = {
      CLIENT_ID: !!process.env.CLIENT_ID,
      CLIENT_SECRET: !!process.env.CLIENT_SECRET,
      BLING_API_URL: !!process.env.BLING_API_URL,
    }

    // Verificar token
    const token = await getValidAccessToken(userEmail)
    const hasValidToken = !!token

    // Testar API se tiver token
    let apiStatus = "no_token"
    if (token) {
      try {
        const response = await fetch(`${process.env.BLING_API_URL}/situacoes/modulos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        apiStatus = response.ok ? "connected" : `error_${response.status}`
      } catch (error) {
        apiStatus = "connection_error"
      }
    }

    return NextResponse.json({
      status: "ok",
      environment: envCheck,
      authentication: {
        hasToken: hasValidToken,
        apiStatus: apiStatus,
      },
      timestamp: new Date().toISOString(),
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
