import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

const userEmail = "admin@johntech.com"

export async function GET() {
  try {
    console.log("Iniciando GET /api/bling/homologacao/produtos")

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      console.error("Token não encontrado para usuário:", userEmail)
      return NextResponse.json(
        { error: "Token de acesso não encontrado. Faça a autenticação OAuth primeiro." },
        { status: 401 },
      )
    }

    console.log("Token obtido, fazendo chamada para API do Bling...")

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    let response = await fetch(`${blingApiUrl}/homologacao/produtos`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    console.log("Resposta da API Bling:", response.status)

    // Se recebeu 401, tenta refresh do token
    if (response.status === 401) {
      console.log("Token inválido, tentando renovar...")
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json({ error: "Falha ao renovar token. Faça a autenticação novamente." }, { status: 401 })
      }

      response = await fetch(`${blingApiUrl}/homologacao/produtos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro na API Bling:", response.status, errorText)
      return NextResponse.json(
        { error: `Erro na API Bling: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Dados obtidos com sucesso:", data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro interno em GET produtos:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("Iniciando POST /api/bling/homologacao/produtos")

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Dados para criar produto:", body)

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    let response = await fetch(`${blingApiUrl}/homologacao/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    // Tentar refresh se necessário
    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(`${blingApiUrl}/homologacao/produtos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro ao criar produto:", response.status, errorText)
      return NextResponse.json({ error: "Erro ao criar produto", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("Produto criado com sucesso:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error("Erro interno em POST produtos:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}
