import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar se há tokens salvos
    const tokenCheck = await sql`
      SELECT 
        email,
        active_plan,
        bling_access_token IS NOT NULL as has_access_token,
        bling_refresh_token IS NOT NULL as has_refresh_token,
        bling_token_expires_at,
        bling_token_expires_at > NOW() as token_valid
      FROM users 
      WHERE bling_access_token IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 5
    `

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      oauth: {
        client_id: process.env.CLIENT_ID ? "configured" : "missing",
        client_secret: process.env.CLIENT_SECRET ? "configured" : "missing",
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
      tokens: {
        total_users_with_tokens: tokenCheck.rowCount,
        users: tokenCheck.rows,
      },
    })
  } catch (error) {
    console.error("OAuth status check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
