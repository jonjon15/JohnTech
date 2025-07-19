import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getValidAccessToken } from "@/lib/bling-auth"

export async function GET() {
  try {
    console.log("=== VERIFICANDO STATUS DO BLING ===")

    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      base_url: process.env.NEXT_PUBLIC_BASE_URL,
      bling_api_url: process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3",
      config: {
        client_id: process.env.BLING_CLIENT_ID ? "✓ Configurado" : "✗ Não configurado",
        client_secret: process.env.BLING_CLIENT_SECRET ? "✓ Configurado" : "✗ Não configurado",
        webhook_secret: process.env.BLING_WEBHOOK_SECRET ? "✓ Configurado" : "✗ Não configurado",
      },
      database: {
        status: "unknown",
        tokens_count: 0,
        webhooks_count: 0,
      },
      auth: {
        status: "unknown",
        user_email: "admin@johntech.com",
        token_valid: false,
        expires_at: null,
      },
      api: {
        status: "unknown",
        last_test: null,
      },
    }

    // Verificar banco de dados
    try {
      const tokenResult = await sql`SELECT COUNT(*) as count FROM bling_tokens`
      const webhookResult =
        await sql`SELECT COUNT(*) as count FROM bling_webhook_logs WHERE processed_at > NOW() - INTERVAL '24 hours'`

      status.database.status = "✓ Conectado"
      status.database.tokens_count = Number.parseInt(tokenResult.rows[0].count)
      status.database.webhooks_count = Number.parseInt(webhookResult.rows[0].count)
    } catch (dbError) {
      console.error("Erro no banco:", dbError)
      status.database.status = "✗ Erro: " + (dbError as Error).message
    }

    // Verificar autenticação
    try {
      const userEmail = "admin@johntech.com"
      const token = await getValidAccessToken(userEmail)

      if (token) {
        status.auth.status = "✓ Token válido"
        status.auth.token_valid = true

        // Buscar data de expiração
        const tokenInfo = await sql`
          SELECT expires_at FROM bling_tokens 
          WHERE user_email = ${userEmail}
          ORDER BY created_at DESC LIMIT 1
        `

        if (tokenInfo.rows.length > 0) {
          status.auth.expires_at = tokenInfo.rows[0].expires_at
        }
      } else {
        status.auth.status = "✗ Token não encontrado ou inválido"
      }
    } catch (authError) {
      console.error("Erro na autenticação:", authError)
      status.auth.status = "✗ Erro: " + (authError as Error).message
    }

    // Testar API do Bling se tiver token válido
    if (status.auth.token_valid) {
      try {
        const token = await getValidAccessToken("admin@johntech.com")
        const testResponse = await fetch(`${status.bling_api_url}/homologacao/produtos?limite=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "User-Agent": "BlingPro/1.0",
          },
        })

        if (testResponse.ok) {
          status.api.status = "✓ API respondendo"
          status.api.last_test = new Date().toISOString()
        } else {
          status.api.status = `✗ API erro: ${testResponse.status}`
        }
      } catch (apiError) {
        console.error("Erro na API:", apiError)
        status.api.status = "✗ Erro: " + (apiError as Error).message
      }
    } else {
      status.api.status = "⚠ Não testado (sem token válido)"
    }

    console.log("Status completo:", status)

    return NextResponse.json(status)
  } catch (error: any) {
    console.error("=== ERRO NO STATUS ===")
    console.error("Erro ao verificar status:", error)

    return NextResponse.json(
      {
        error: "Erro ao verificar status",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
