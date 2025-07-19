import { NextResponse } from "next/server"
import { getValidAccessToken, clearTokens } from "@/lib/bling-auth"

const userEmail = "admin@johntech.com"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("=== GET produto individual ===", params.id)

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(
        { error: "Token não encontrado", message: "Faça a autenticação OAuth primeiro" },
        { status: 401 },
      )
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos/${params.id}`

    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        await clearTokens(userEmail)
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BlingPro/1.0",
        },
      })
    }

    const responseText = await response.text()

    if (!response.ok) {
      console.error("Erro ao buscar produto:", response.status, responseText)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }
      return NextResponse.json({ error: "Erro ao buscar produto", details: errorData }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro em GET produto individual:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("=== PUT produto ===", params.id)

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Dados para atualizar:", body)

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos/${params.id}`

    let response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      body: JSON.stringify(body),
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        await clearTokens(userEmail)
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BlingPro/1.0",
        },
        body: JSON.stringify(body),
      })
    }

    const responseText = await response.text()

    if (!response.ok) {
      console.error("Erro ao atualizar produto:", response.status, responseText)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }
      return NextResponse.json({ error: "Erro ao atualizar produto", details: errorData }, { status: response.status })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: "Produto atualizado com sucesso" }
    }

    console.log("Produto atualizado com sucesso")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro em PUT produto:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("=== DELETE produto ===", params.id)

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos/${params.id}`

    let response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "BlingPro/1.0",
      },
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        await clearTokens(userEmail)
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "User-Agent": "BlingPro/1.0",
        },
      })
    }

    const responseText = await response.text()

    if (!response.ok) {
      console.error("Erro ao deletar produto:", response.status, responseText)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }
      return NextResponse.json({ error: "Erro ao deletar produto", details: errorData }, { status: response.status })
    }

    console.log("Produto deletado com sucesso")
    return NextResponse.json({ message: "Produto deletado com sucesso" })
  } catch (error: any) {
    console.error("Erro em DELETE produto:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}
