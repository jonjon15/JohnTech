import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const userEmail = "admin@example.com"

  try {
    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(
        { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
        { status: 401 },
      )
    }

    let response = await fetch(`${process.env.BLING_API_URL}/homologacao/produtos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json(
          { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
          { status: 401 },
        )
      }
      response = await fetch(`${process.env.BLING_API_URL}/homologacao/produtos/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }))
      console.error("Erro ao obter produto:", response.status, errorData)
      return NextResponse.json({ error: "Erro ao obter produto", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro ao obter produto:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const userEmail = "admin@example.com"

  try {
    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(
        { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
        { status: 401 },
      )
    }

    const body = await request.json()

    let response = await fetch(`${process.env.BLING_API_URL}/homologacao/produtos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json(
          { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
          { status: 401 },
        )
      }
      response = await fetch(`${process.env.BLING_API_URL}/homologacao/produtos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }))
      console.error("Erro ao atualizar produto:", response.status, errorData)
      return NextResponse.json({ error: "Erro ao atualizar produto", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const userEmail = "admin@example.com"

  try {
    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(
        { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
        { status: 401 },
      )
    }

    let response = await fetch(`${process.env.BLING_API_URL}/homologacao/produtos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json(
          { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
          { status: 401 },
        )
      }
      response = await fetch(`${process.env.BLING_API_URL}/homologacao/produtos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }))
      console.error("Erro ao excluir produto:", response.status, errorData)
      return NextResponse.json({ error: "Erro ao excluir produto", details: errorData }, { status: response.status })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: error.message }, { status: 500 })
  }
}
