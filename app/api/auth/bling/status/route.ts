import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("=== VERIFICANDO STATUS DA AUTENTICAÇÃO ===")

    const userEmail = "admin@johntech.com"

    // Buscar tokens no banco
    const result = await sql`
      SELECT 
        user_email,
        expires_at,
        created_at,
        updated_at,
        CASE 
          WHEN expires_at > NOW() THEN true 
          ELSE false 
        END as is_valid
      FROM bling_tokens 
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({
        status: "error",
        message: "Nenhum token encontrado",
        auth_status: "not_authenticated",
        user_email: userEmail,
        requires_auth: true,
        timestamp: new Date().toISOString(),
      })
    }

    const tokenData = result.rows[0]
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    const isExpired = now >= expiresAt

    console.log("Status do token:", {
      user_email: tokenData.user_email,
      expires_at: tokenData.expires_at,
      is_expired: isExpired,
      is_valid: tokenData.is_valid,
    })

    return NextResponse.json({
      status: "success",
      message: isExpired ? "Token expirado" : "Token válido",
      auth_status: isExpired ? "expired" : "authenticated",
      user_email: tokenData.user_email,
      expires_at: tokenData.expires_at,
      created_at: tokenData.created_at,
      updated_at: tokenData.updated_at,
      is_expired: isExpired,
      is_valid: tokenData.is_valid,
      requires_auth: isExpired,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro no status da autenticação:", error)

    return NextResponse.json({
      status: "error",
      message: "Erro ao verificar autenticação",
      details: error.message,
      auth_status: "unknown",
      timestamp: new Date().toISOString(),
    })
  }
}
