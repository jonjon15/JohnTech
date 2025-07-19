import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET() {
  try {
    const userEmail = "admin@johntech.com"

    // Verificar se temos um token válido
    const token = await getValidAccessToken(userEmail)

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: "Nenhum token válido encontrado. Faça a autenticação OAuth.",
      })
    }

    // Testar o token fazendo uma chamada simples para a API do Bling
    const testResponse = await fetch(`${process.env.BLING_API_URL}/situacoes/modulos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (testResponse.ok) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        api_status: "connected",
        message: "Token válido e API acessível",
      })
    } else {
      return NextResponse.json({
        success: false,
        authenticated: true,
        api_status: "error",
        message: `API retornou status ${testResponse.status}`,
      })
    }
  } catch (error: any) {
    console.error("Erro ao verificar status do Bling:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
