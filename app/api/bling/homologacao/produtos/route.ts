import { NextResponse } from "next/server"
import { getValidAccessToken, clearTokens } from "@/lib/bling-auth"

const userEmail = "admin@johntech.com"
const REQUEST_TIMEOUT = 7000 // 7 segundos para evitar timeout de 10s

export async function GET() {
  try {
    console.log("=== GET PRODUTOS HOMOLOGAÇÃO - INÍCIO ===")
    const startTime = Date.now()

    // Obter token com timeout rápido
    let token = await getValidAccessToken(userEmail)
    if (!token) {
      console.error("❌ Token não encontrado")
      return NextResponse.json(
        {
          error: "Token não encontrado",
          message: "Faça autenticação OAuth em /configuracao-bling",
          auth_url: "/configuracao-bling",
        },
        { status: 401 },
      )
    }

    console.log("✅ Token obtido em", Date.now() - startTime, "ms")

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos?limite=10`

    console.log("🔗 URL:", url)

    // Primeira tentativa com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("📡 Primeira resposta:", response.status, "em", Date.now() - startTime, "ms")

    // Se 401, tentar refresh UMA VEZ
    if (response.status === 401) {
      console.log("🔄 Token inválido, tentando refresh...")

      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        await clearTokens(userEmail)
        return NextResponse.json(
          {
            error: "Falha ao renovar token",
            message: "Faça nova autenticação",
            auth_url: "/configuracao-bling",
          },
          { status: 401 },
        )
      }

      // Segunda tentativa
      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), REQUEST_TIMEOUT)

      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BlingPro/1.0",
        },
        signal: controller2.signal,
      })

      clearTimeout(timeoutId2)
      console.log("📡 Segunda resposta:", response.status, "em", Date.now() - startTime, "ms")
    }

    const responseText = await response.text()
    console.log("📄 Resposta recebida:", responseText.length, "chars em", Date.now() - startTime, "ms")

    if (!response.ok) {
      console.error("❌ Erro na API:", response.status)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }

      return NextResponse.json(
        {
          error: `API Bling erro ${response.status}`,
          details: errorData,
          url: url,
          elapsed_time: Date.now() - startTime,
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Erro no parse:", parseError)
      return NextResponse.json(
        {
          error: "Resposta inválida da API",
          details: responseText.substring(0, 500),
          elapsed_time: Date.now() - startTime,
        },
        { status: 500 },
      )
    }

    const totalTime = Date.now() - startTime
    console.log("✅ SUCESSO! Produtos obtidos em", totalTime, "ms")
    console.log("📊 Total de produtos:", data.data?.length || 0)

    return NextResponse.json({
      ...data,
      _meta: {
        elapsed_time: totalTime,
        timestamp: new Date().toISOString(),
        total_products: data.data?.length || 0,
      },
    })
  } catch (error: any) {
    const totalTime = Date.now() - (Date.now() - 1000) // aproximado
    console.error("❌ ERRO GERAL:", error.message)

    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Timeout na requisição",
          message: "API do Bling demorou mais que 7 segundos",
          elapsed_time: totalTime,
          suggestion: "Tente novamente em alguns segundos",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        error: "Erro interno",
        message: error.message,
        elapsed_time: totalTime,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== POST PRODUTO HOMOLOGAÇÃO - INÍCIO ===")
    const startTime = Date.now()

    let token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("📝 Dados do produto:", JSON.stringify(body, null, 2))

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const url = `${blingApiUrl}/homologacao/produtos`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    let response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "BlingPro/1.0",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Tentar refresh se necessário
    if (response.status === 401) {
      token = await getValidAccessToken(userEmail, true)
      if (!token) {
        await clearTokens(userEmail)
        return NextResponse.json({ error: "Falha ao renovar token" }, { status: 401 })
      }

      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), REQUEST_TIMEOUT)

      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BlingPro/1.0",
        },
        body: JSON.stringify(body),
        signal: controller2.signal,
      })

      clearTimeout(timeoutId2)
    }

    const responseText = await response.text()
    const totalTime = Date.now() - startTime

    if (!response.ok) {
      console.error("❌ Erro ao criar produto:", response.status)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }

      return NextResponse.json(
        {
          error: "Erro ao criar produto",
          details: errorData,
          elapsed_time: totalTime,
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: "Produto criado com sucesso", response: responseText }
    }

    console.log("✅ PRODUTO CRIADO em", totalTime, "ms")
    return NextResponse.json({
      ...data,
      _meta: {
        elapsed_time: totalTime,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ ERRO:", error.message)

    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Timeout na criação",
          message: "Operação demorou mais que 7 segundos",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        error: "Erro interno",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
