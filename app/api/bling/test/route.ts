import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET() {
  try {
    console.log("=== TESTANDO CONEXÃO COM API BLING ===")

    const userEmail = "admin@johntech.com"
    const token = await getValidAccessToken(userEmail)

    if (!token) {
      return NextResponse.json(
        {
          error: "Token não encontrado",
          message: "Faça a autenticação OAuth primeiro",
          auth_url: "/configuracao-bling",
        },
        { status: 401 },
      )
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

    // Testar endpoint de produtos de homologação
    const testResponse = await fetch(`${blingApiUrl}/homologacao/produtos?limite=1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
    })

    const responseText = await testResponse.text()

    console.log("Resposta do teste:", {
      status: testResponse.status,
      headers: Object.fromEntries(testResponse.headers.entries()),
      body: responseText.substring(0, 500),
    })

    if (!testResponse.ok) {
      return NextResponse.json(
        {
          error: `API Bling retornou erro: ${testResponse.status}`,
          details: responseText,
          url: `${blingApiUrl}/homologacao/produtos`,
        },
        { status: testResponse.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { raw_response: responseText }
    }

    return NextResponse.json({
      success: true,
      message: "Conexão com API Bling funcionando",
      api_url: `${blingApiUrl}/homologacao/produtos`,
      response_status: testResponse.status,
      data: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("=== ERRO NO TESTE DA API ===")
    console.error("Erro:", error)

    return NextResponse.json(
      {
        error: "Erro ao testar API Bling",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
