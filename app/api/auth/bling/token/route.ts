import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db" // Importa o cliente Neon

const BLING_CLIENT_ID = process.env.BLING_CLIENT_ID || "44866dbd8fe131077d73dbe3d60531016512c855"
const BLING_CLIENT_SECRET =
  process.env.BLING_CLIENT_SECRET || "18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1"
const BLING_TOKEN_URL = "https://www.bling.com.br/Api/v3/oauth/token"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      console.error("No authorization code provided")
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    const redirectUri = "https://johntech.vercel.app/auth/callback"

    console.log("=== TOKEN EXCHANGE DEBUG ===")
    console.log("Code:", code)
    console.log("Redirect URI:", redirectUri)
    console.log("Client ID (from env):", BLING_CLIENT_ID ? "Set" : "Not Set")
    console.log("Client Secret (from env):", BLING_CLIENT_SECRET ? "Set" : "Not Set")

    const formData = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    })

    const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString("base64")

    console.log("Form data (should NOT contain client_id/secret):", formData.toString())
    console.log("Authorization Header (Basic):", `Basic ${credentials.substring(0, 10)}...`)

    const tokenResponse = await fetch(BLING_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "BlingPro/1.0",
        Authorization: `Basic ${credentials}`,
      },
      body: formData,
    })

    const tokenData = await tokenResponse.json()

    console.log("=== BLING RESPONSE ===")
    console.log("Status:", tokenResponse.status)
    console.log("Headers:", Object.fromEntries(tokenResponse.headers.entries()))
    console.log("Data:", tokenData)

    if (!tokenResponse.ok) {
      console.error("Bling token error:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        data: tokenData,
      })

      return NextResponse.json(
        {
          error: tokenData.error_description || tokenData.error || "Failed to obtain access token",
          details: {
            status: tokenResponse.status,
            bling_error: tokenData,
          },
        },
        { status: 400 },
      )
    }

    console.log("=== SUCCESS ===")
    console.log("Token obtained successfully")

    // --- NOVO: Armazenar tokens no banco de dados ---
    const { access_token, refresh_token, expires_in } = tokenData
    const expiresAt = new Date(Date.now() + expires_in * 1000) // Calcula a data de expiração

    // Para fins de demonstração, vamos associar ao usuário 'admin@example.com'
    // Em uma aplicação real, você usaria o ID do usuário logado.
    try {
      await sql`
        UPDATE users
        SET 
          bling_access_token = ${access_token},
          bling_refresh_token = ${refresh_token},
          bling_token_expires_at = ${expiresAt.toISOString()}
        WHERE email = 'admin@example.com'
      `
      console.log("Tokens Bling salvos no banco de dados para admin@example.com")
    } catch (dbError) {
      console.error("Erro ao salvar tokens no banco de dados:", dbError)
      // Decida como lidar com erros de DB: pode ser um erro crítico ou apenas logar
    }
    // --- FIM NOVO ---

    return NextResponse.json({
      success: true,
      message: "Successfully authenticated with Bling",
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    })
  } catch (error) {
    console.error("=== CRITICAL ERROR ===")
    console.error("Token exchange error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
