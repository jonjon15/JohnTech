// API Route para tratar autenticação OAuth do Bling
import { NextRequest, NextResponse } from "next/server";


import { encrypt } from "@/lib/utils"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    // Validação do state (CSRF)
    const cookies = req.cookies
    const stateCookie = cookies.get("bling_oauth_state")?.value
    if (!state || !stateCookie || state !== stateCookie) {
      return NextResponse.json({ error: "State inválido ou ausente" }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: "Authorization code ausente" }, { status: 400 })
    }

    // Troca do code por tokens
    const clientId = process.env.CLIENT_ID!
    const clientSecret = process.env.CLIENT_SECRET!
    const redirectUri = process.env.REDIRECT_URI || (process.env.NEXTAUTH_URL?.includes('localhost')
      ? 'https://localhost:3000/api/auth/bling/callback'
      : 'https://johntech.vercel.app/api/auth/bling/callback')
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const tokenRes = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "1.0",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      return NextResponse.json({ error: "Falha ao obter tokens", details: errText }, { status: 400 })
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in
    const userInfoRes = await fetch("https://www.bling.com.br/Api/v3/usuarios/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    let userEmail = ""
    if (userInfoRes.ok) {
      const userInfo = await userInfoRes.json()
      userEmail = userInfo?.data?.email || ""
    }
    if (!userEmail) userEmail = "unknown@bling.com"

    // Criptografa o refresh_token antes de salvar
    const encryptedRefreshToken = encrypt(refreshToken)
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Upsert na tabela bling_tokens
    await sql`
      INSERT INTO bling_tokens (user_email, access_token, refresh_token, expires_at, updated_at)
      VALUES (${userEmail}, ${accessToken}, ${encryptedRefreshToken}, ${expiresAt}, NOW())
      ON CONFLICT (user_email) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `

    // Limpa o cookie de state
    const response = NextResponse.redirect("/dashboard")
    response.cookies.set("bling_oauth_state", "", { maxAge: 0 })
    return response
  } catch (err) {
    console.error("Erro no callback OAuth:", err)
    return NextResponse.json({ error: "Erro interno no callback OAuth" }, { status: 500 })
  }
}
