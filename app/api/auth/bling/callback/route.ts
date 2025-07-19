import { NextResponse } from "next/server"
import { saveTokens } from "@/lib/bling-auth"
import { handleBlingApiError, createBlingApiResponse } from "@/lib/bling-error-handler"

const userEmail = "admin@johntech.com"

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔐 [${requestId}] POST /api/auth/bling/callback - INÍCIO`)

    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json(
        handleBlingApiError(new Error("Código de autorização não fornecido"), "OAUTH_CALLBACK"),
        { status: 400 },
      )
    }

    console.log(`📝 [${requestId}] Código recebido: ${code.substring(0, 10)}...`)
    console.log(`📝 [${requestId}] State: ${state}`)

    // Preparar credenciais para Basic Auth
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        handleBlingApiError(new Error("Credenciais do Bling não configuradas"), "OAUTH_CALLBACK"),
        { status: 500 },
      )
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`

    console.log(`🔗 [${requestId}] Redirect URI: ${redirectUri}`)

    // Trocar código por tokens
    const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
        "User-Agent": "BlingPro/1.0",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    const responseText = await tokenResponse.text()
    console.log(`📡 [${requestId}] Resposta do token:`, {
      status: tokenResponse.status,
      headers: Object.fromEntries(tokenResponse.headers.entries()),
      body: responseText.substring(0, 200) + "...",
    })

    if (!tokenResponse.ok) {
      console.error(`❌ [${requestId}] Erro ao obter token:`, responseText)
      return NextResponse.json(
        handleBlingApiError({ response: { status: tokenResponse.status, data: responseText } }, "OAUTH_CALLBACK"),
        { status: tokenResponse.status },
      )
    }

    let tokenData
    try {
      tokenData = JSON.parse(responseText)
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro ao fazer parse da resposta:`, parseError)
      return NextResponse.json(
        handleBlingApiError(new Error("Resposta inválida do servidor Bling"), "OAUTH_CALLBACK"),
        { status: 502 },
      )
    }

    // Validar dados do token
    if (!tokenData.access_token || !tokenData.refresh_token) {
      console.error(`❌ [${requestId}] Tokens não encontrados na resposta:`, tokenData)
      return NextResponse.json(handleBlingApiError(new Error("Tokens não encontrados na resposta"), "OAUTH_CALLBACK"), {
        status: 502,
      })
    }

    console.log(`✅ [${requestId}] Tokens obtidos:`, {
      access_token: tokenData.access_token.substring(0, 20) + "...",
      refresh_token: tokenData.refresh_token.substring(0, 20) + "...",
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    })

    // Salvar tokens no banco
    const saved = await saveTokens(userEmail, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)

    if (!saved) {
      return NextResponse.json(handleBlingApiError(new Error("Erro ao salvar tokens no banco"), "OAUTH_CALLBACK"), {
        status: 500,
      })
    }

    // Testar token fazendo uma chamada para /me
    try {
      console.log(`🧪 [${requestId}] Testando token...`)

      const meResponse = await fetch("https://www.bling.com.br/Api/v3/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
          "User-Agent": "BlingPro/1.0",
        },
      })

      if (meResponse.ok) {
        const meData = await meResponse.json()
        console.log(`✅ [${requestId}] Token válido! Usuário:`, meData.data?.nome || "N/A")
      } else {
        console.warn(`⚠️ [${requestId}] Token salvo mas teste falhou:`, meResponse.status)
      }
    } catch (testError) {
      console.warn(`⚠️ [${requestId}] Erro no teste do token:`, testError)
      // Não falhar por erro no teste
    }

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Callback concluído em ${elapsedTime}ms`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          message: "Autenticação realizada com sucesso",
          user_email: userEmail,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          scope: tokenData.scope,
          authenticated_at: new Date().toISOString(),
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no callback:`, error)

    return NextResponse.json(handleBlingApiError(error, "OAUTH_CALLBACK"), { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de callback OAuth do Bling",
    method: "POST",
    parameters: {
      code: "string (obrigatório)",
      state: "string (opcional)",
    },
  })
}
