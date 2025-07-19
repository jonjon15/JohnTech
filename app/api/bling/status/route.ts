import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET() {
  try {
    console.log("=== VERIFICANDO STATUS DO BLING ===")

    const userEmail = "admin@johntech.com"

    // Verificar se temos token válido
    const token = await getValidAccessToken(userEmail)

    if (!token) {
      return NextResponse.json({
        status: "error",
        message: "Token não encontrado",
        details: "Faça a autenticação OAuth primeiro",
        auth_required: true,
      })
    }

    // Testar conectividade com API do Bling
    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

    console.log("Testando conectividade com:", blingApiUrl)

    const response = await fetch(`${blingApiUrl}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      signal: AbortSignal.timeout(8000), // 8 segundos timeout
    })

    const responseText = await response.text()

    console.log("Resposta do Bling:", {
      status: response.status,
      body: responseText.substring(0, 200),
    })

    if (!response.ok) {
      return NextResponse.json({
        status: "error",
        message: "Erro na API do Bling",
        details: {
          status: response.status,
          response: responseText,
        },
        bling_api_status: "down",
      })
    }

    const data = JSON.parse(responseText)

    return NextResponse.json({
      status: "success",
      message: "Bling API funcionando",
      bling_api_status: "up",
      user_info: data.data || data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro no status do Bling:", error)

    return NextResponse.json({
      status: "error",
      message: "Erro interno",
      details: error.message,
      bling_api_status: "unknown",
      timestamp: new Date().toISOString(),
    })
  }
}
