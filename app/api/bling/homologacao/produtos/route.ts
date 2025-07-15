import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"

const userEmail = "admin@example.com" // ajuste para multi-usuário conforme necessidade

async function fetchProdutos(accessToken: string) {
  const blingApiUrl = process.env.BLING_API_URL!
  return fetch(`${blingApiUrl}/homologacao/produtos`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function GET() {
  try {
    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(
        { error: "Token de acesso Bling não encontrado. Por favor, reautentique." },
        { status: 401 },
      )
    }

    let response = await fetchProdutos(token)

    // Se recebeu 401, tenta refresh + segunda tentativa
    if (response.status === 401) {
      console.warn("Access token inválido. Tentando refresh e nova chamada…")
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        return NextResponse.json({ error: "Falha ao renovar token. Faça login novamente." }, { status: 401 })
      }
      response = await fetchProdutos(token)
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error("Erro GET homologacao/produtos:", response.status, err)
      return NextResponse.json({ error: `Erro Bling: ${response.status}`, details: err }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("GET homologacao/produtos — erro interno:", err)
    return NextResponse.json({ error: "Erro interno", message: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Sem token. Reautentique." }, { status: 401 })
    }

    const body = await request.json()
    const blingApiUrl = process.env.BLING_API_URL!
    let response = await fetch(`${blingApiUrl}/homologacao/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

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
        },
        body: JSON.stringify(body),
      })
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return NextResponse.json({ error: "Erro Bling", details: err }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error("POST homologacao/produtos — erro:", err)
    return NextResponse.json({ error: "Erro interno", message: err.message }, { status: 500 })
  }
}
