import { NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { rateLimit } from "@/lib/bling-rate-limit"
import { handleBlingApiError } from "@/lib/bling-error-handler"

// Endpoint para consulta de notas fiscais eletrônicas (NFe) Bling
export async function GET(request: NextRequest) {
  await rateLimit("bling_nfe")
  try {
    const { searchParams } = new URL(request.url)
    const pagina = Math.max(1, Number.parseInt(searchParams.get("pagina") || "1"))
    const limite = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limite") || "20")))
    const numero = searchParams.get("numero")
    const situacao = searchParams.get("situacao")

    const accessToken = await getValidAccessToken("admin@johntech.com")
    if (!accessToken) {
      return NextResponse.json({ error: "Token de acesso não disponível" }, { status: 401 })
    }

    const url = new URL("https://www.bling.com.br/Api/v3/notasfiscais")
    url.searchParams.set("pagina", pagina.toString())
    url.searchParams.set("limite", limite.toString())
    if (numero) url.searchParams.set("numero", numero)
    if (situacao) url.searchParams.set("situacao", situacao)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(handleBlingApiError(data, "bling_nfe"), { status: res.status })
    }
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(handleBlingApiError(error, "bling_nfe"), { status: 500 })
  }
}

// Implemente POST, PUT, DELETE conforme necessidade
