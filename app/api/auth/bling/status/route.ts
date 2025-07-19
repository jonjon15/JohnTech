import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createBlingApiResponse, handleBlingApiError } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/auth/bling/status - Verificando status da autenticação...")

    // Verificar se a tabela de tokens existe
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'bling_auth_tokens'
    `

    if (tableCheck.rows.length === 0) {
      return NextResponse.json(
        createBlingApiResponse(false, null, {
          code: "TABLE_NOT_FOUND",
          message: 'Tabela "bling_auth_tokens" não existe. Execute o script SQL primeiro.',
          statusCode: 500,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Buscar tokens existentes
    const tokens = await sql`
      SELECT 
        user_email,
        token_type,
        expires_at,
        created_at,
        updated_at,
        CASE 
          WHEN expires_at > NOW() THEN true 
          ELSE false 
        END as is_valid
      FROM bling_auth_tokens
      ORDER BY created_at DESC
    `

    // Verificar token específico do usuário admin
    const adminToken = await sql`
      SELECT 
        user_email,
        expires_at,
        created_at,
        CASE 
          WHEN expires_at > NOW() THEN true 
          ELSE false 
        END as is_valid
      FROM bling_auth_tokens
      WHERE user_email = 'admin@johntech.com'
      LIMIT 1
    `

    const authData = {
      table_exists: true,
      total_tokens: tokens.rows.length,
      valid_tokens: tokens.rows.filter((token) => token.is_valid).length,
      expired_tokens: tokens.rows.filter((token) => !token.is_valid).length,
      admin_token: adminToken.rows[0] || null,
      admin_authenticated: adminToken.rows.length > 0 && adminToken.rows[0].is_valid,
      tokens: tokens.rows.map((token) => ({
        user_email: token.user_email,
        is_valid: token.is_valid,
        expires_at: token.expires_at,
        created_at: token.created_at,
      })),
      environment: {
        client_id_configured: !!process.env.BLING_CLIENT_ID,
        client_secret_configured: !!process.env.BLING_CLIENT_SECRET,
        api_url_configured: !!process.env.BLING_API_URL,
        base_url_configured: !!process.env.NEXT_PUBLIC_BASE_URL,
      },
    }

    console.log(`✅ Auth status: ${tokens.rows.length} tokens, admin: ${authData.admin_authenticated}`)

    return NextResponse.json(createBlingApiResponse(true, authData), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("❌ Erro ao verificar status da autenticação:", error)

    const blingError = handleBlingApiError(error, "auth-status")
    return NextResponse.json(createBlingApiResponse(false, null, blingError), {
      status: blingError.statusCode || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
