import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredEnvVars = ["BLING_CLIENT_ID", "BLING_CLIENT_SECRET", "BLING_WEBHOOK_SECRET"]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Variáveis de ambiente faltando",
          missing: missingVars,
        },
        { status: 500 },
      )
    }

    // Teste básico de conectividade com a API do Bling
    const testUrl = "https://www.bling.com.br/Api/v3/oauth/authorize"

    try {
      const response = await fetch(testUrl, { method: "HEAD" })

      return NextResponse.json({
        status: "ok",
        message: "Configuração Bling OK",
        bling_api_accessible: response.ok,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return NextResponse.json({
        status: "warning",
        message: "Configuração OK, mas API Bling inacessível",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro interno",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
