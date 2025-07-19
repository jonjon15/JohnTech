import { NextResponse } from "next/server"
import { getValidAccessToken, clearTokens } from "@/lib/bling-auth"

const userEmail = "admin@johntech.com"

export async function GET() {
  try {
    console.log("=== INICIANDO GET /api/bling/homologacao/produtos ===")

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      console.error("Token não encontrado para usuário:", userEmail)
      return NextResponse.json(
        {
          error: "Token de acesso não encontrado",
          message: "Faça a autenticação OAuth primeiro em /configuracao-bling",
        },
        { status: 401 },
      )
    }

    console.log("Token obtido, fazendo chamada para API do Bling...")

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos`

    console.log("URL da chamada:", url)

    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
    })

    console.log("Resposta da API Bling:", response.status)

    // Se recebeu 401, tenta refresh do token UMA VEZ
    if (response.status === 401) {
      console.log("Token inválido (401), tentando renovar...")

      token = await getValidAccessToken(userEmail, true) // forçar refresh

      if (!token) {
        console.error("Falha ao renovar token, limpando tokens do banco")
        await clearTokens(userEmail)
        return NextResponse.json(
          {
            error: "Falha ao renovar token",
            message: "Faça a autenticação novamente em /configuracao-bling",
          },
          { status: 401 },
        )
      }

      console.log("Token renovado, tentando novamente...")

      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BlingPro/1.0",
        },
      })

      console.log("Segunda tentativa - Status:", response.status)
    }

    const responseText = await response.text()
    console.log("Resposta completa:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
    })

    if (!response.ok) {
      console.error("Erro na API Bling:", response.status, responseText)

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }

      return NextResponse.json(
        {
          error: `Erro na API Bling: ${response.status}`,
          details: errorData,
          url: url,
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Erro ao fazer parse da resposta:", parseError)
      return NextResponse.json({ error: "Resposta inválida da API Bling", details: responseText }, { status: 500 })
    }

    console.log("=== DADOS OBTIDOS COM SUCESSO ===")
    console.log("Número de produtos:", data.data?.length || 0)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("=== ERRO INTERNO ===")
    console.error("Erro em GET produtos:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== INICIANDO POST /api/bling/homologacao/produtos ===")

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      console.error("Token não encontrado para usuário:", userEmail)
      return NextResponse.json(
        { error: "Token não encontrado", message: "Faça a autenticação OAuth primeiro" },
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log("Dados para criar produto:", JSON.stringify(body, null, 2))

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos`

    let response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      body: JSON.stringify(body),
    })

    console.log("Resposta inicial:", response.status)

    // Tentar refresh se necessário
    if (response.status === 401) {
      console.log("Token inválido, tentando renovar...")

      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        await clearTokens(userEmail)
        return NextResponse.json(
          { error: "Falha ao renovar token", message: "Faça a autenticação novamente" },
          { status: 401 },
        )
      }

      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BlingPro/1.0",
        },
        body: JSON.stringify(body),
      })

      console.log("Segunda tentativa:", response.status)
    }

    const responseText = await response.text()
    console.log("Resposta completa:", {
      status: response.status,
      body: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
    })

    if (!response.ok) {
      console.error("Erro ao criar produto:", response.status, responseText)

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }

      return NextResponse.json({ error: "Erro ao criar produto", details: errorData }, { status: response.status })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: "Produto criado com sucesso", response: responseText }
    }

    console.log("=== PRODUTO CRIADO COM SUCESSO ===")
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error("=== ERRO INTERNO ===")
    console.error("Erro em POST produtos:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
