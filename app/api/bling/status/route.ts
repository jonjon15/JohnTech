import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET() {
  try {
    const userEmail = "admin@johntech.com"
    const accessToken = await getValidAccessToken(userEmail)

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token de acesso não disponível. Faça a autenticação OAuth primeiro.",
          authenticated: false,
        },
        { status: 401 },
      )
    }

    // Testar conexão com a API do Bling
    const response = await fetch(`${process.env.BLING_API_URL}/produtos?limite=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Conexão com API Bling funcionando corretamente",
        authenticated: true,
        api_url: process.env.BLING_API_URL,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Erro na API Bling: ${response.status}`,
          authenticated: true,
          api_url: process.env.BLING_API_URL,
        },
        { status: response.status },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno ao verificar status da API Bling",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
