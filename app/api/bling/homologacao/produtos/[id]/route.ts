import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

const userEmail = "admin@johntech.com"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("Buscando produto ID:", id)

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    let response = await fetch(`${blingApiUrl}/homologacao/produtos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(`${blingApiUrl}/homologacao/produtos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro ao buscar produto: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    console.log("Atualizando produto ID:", id, "com dados:", body)

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    let response = await fetch(`${blingApiUrl}/homologacao/produtos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(`${blingApiUrl}/homologacao/produtos/${id}`, {
        method: "PUT",
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
      return NextResponse.json(
        { error: `Erro ao atualizar produto: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("Deletando produto ID:", id)

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    let response = await fetch(`${blingApiUrl}/homologacao/produtos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      response = await fetch(`${blingApiUrl}/homologacao/produtos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro ao deletar produto: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, message: "Produto deletado com sucesso" })
  } catch (error: any) {
    console.error("Erro ao deletar produto:", error)
    return NextResponse.json({ error: "Erro interno", message: error.message }, { status: 500 })
  }
}
