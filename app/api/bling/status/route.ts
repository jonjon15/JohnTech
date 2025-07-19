import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/bling/status - Verificando status da API Bling...")

    // Verificar se há token válido
    const tokenCheck = await sql`
      SELECT access_token, expires_at, user_email
      FROM bling_auth_tokens 
      WHERE user_email = 'admin@johntech.com' 
      AND expires_at > NOW()
      LIMIT 1
    `

    if (tokenCheck.rows.length === 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "NO_VALID_TOKEN",
          message: "Nenhum token válido encontrado. Faça a autenticação primeiro.",
          statusCode: 401,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    const token = tokenCheck.rows[0].access_token

    // Testar conexão com a API do Bling
    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"

    try {
      const response = await fetch(`${blingApiUrl}/produtos?limite=1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      })

      const responseData = await response.json()

      const apiData = {
        api_connected: response.ok,
        status_code: response.status,
        token_valid: response.status !== 401,
        response_time: "< 10s",
        api_url: blingApiUrl,
        user_email: tokenCheck.rows[0].user_email,
        token_expires_at: tokenCheck.rows[0].expires_at,
        test_endpoint: "/produtos",
        response_sample: response.ok ? responseData : null,
        error_details: !response.ok ? responseData : null,
      }

      console.log(`✅ API Bling status: ${response.status} - ${response.ok ? "OK" : "Erro"}`)

      return NextResponse.json(createBlingApiResponse(true, apiData), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (fetchError: any) {
      const apiData = {
        api_connected: false,
        status_code: 0,
        token_valid: true, // Token existe, mas API não responde
        response_time: "timeout",
        api_url: blingApiUrl,
        user_email: tokenCheck.rows[0].user_email,
        token_expires_at: tokenCheck.rows[0].expires_at,
        test_endpoint: "/produtos",
        error_details: fetchError.message,
      }

      return NextResponse.json(createBlingApiResponse(false, apiData, handleBlingApiError(fetchError, "bling-api")), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error: any) {
    console.error("❌ Erro ao verificar status da API Bling:", error)

    const blingError = handleBlingApiError(error, "bling-status")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
