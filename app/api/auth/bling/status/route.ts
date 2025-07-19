import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("=== VERIFICANDO STATUS DA AUTENTICAÇÃO ===")

    const status = {
      timestamp: new Date().toISOString(),
      config: {
        client_id: process.env.BLING_CLIENT_ID ? "✓ Configurado" : "✗ Não configurado",
        client_secret: process.env.BLING_CLIENT_SECRET ? "✓ Configurado" : "✗ Não configurado",
        base_url: process.env.NEXT_PUBLIC_BASE_URL || "✗ Não configurado",
      },
      oauth_urls: {
        authorize: `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${process.env.BLING_CLIENT_ID}&state=${Date.now()}&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`)}`,
        token: "https://www.bling.com.br/Api/v3/oauth/token",
        callback: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
      tokens: [],
      error: null,
    }

    // Verificar tokens no banco
    try {
      const tokensResult = await sql`
        SELECT 
          user_email,
          expires_at,
          created_at,
          updated_at,
          CASE 
            WHEN expires_at > NOW() THEN 'válido'
            ELSE 'expirado'
          END as status
        FROM bling_tokens 
        ORDER BY created_at DESC
      `

      status.tokens = tokensResult.rows.map((row) => ({
        user_email: row.user_email,
        status: row.status,
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        expires_in_minutes: Math.round((new Date(row.expires_at).getTime() - Date.now()) / (1000 * 60)),
      }))
    } catch (error) {
      console.error("Erro ao verificar tokens:", error)
      status.error = (error as Error).message
    }

    console.log("Status da autenticação:", status)

    return NextResponse.json(status)
  } catch (error: any) {
    console.error("=== ERRO NO STATUS DA AUTENTICAÇÃO ===")
    console.error("Erro:", error)

    return NextResponse.json(
      {
        error: "Erro ao verificar status da autenticação",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
