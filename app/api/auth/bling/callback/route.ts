import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
// import { getUserInfo } from "@/lib/userInfo" // Declare the getUserInfo variable
// import { getUserInfo } from "@/lib/userInfo" // Use this if your tsconfig.json has a "paths" alias for "@"
// import { getUserInfo } from "@/lib/userInfo" // Use this if your tsconfig.json has a "paths" alias for "@"
import { getUserInfo } from "@/lib/userInfo"

const CLIENT_ID = process.env.CLIENT_ID!
const CLIENT_SECRET = process.env.CLIENT_SECRET!
const REDIRECT_URI = process.env.REDIRECT_URI!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Redireciona para a página de callback com os parâmetros
  const callbackUrl = new URL("/auth/callback", request.url)

  if (error) {
    callbackUrl.searchParams.set("error", error)
  }

  if (code) {
    callbackUrl.searchParams.set("code", code)
  }

  if (state) {
    callbackUrl.searchParams.set("state", state)
  }

  // Verifica se houve erro na autorização
  if (error) {
    console.error("Erro na autorização:", error)
    return NextResponse.redirect(callbackUrl)
  }

  // Verifica se o código foi recebido
  if (!code) {
    console.error("Código de autorização não recebido")
    return NextResponse.redirect(callbackUrl)
  }

  // Verifica o state (opcional, mas recomendado para segurança)
  if (state) {
    console.log("State recebido:", state)
  }

  try {
    // Troca o código pelo token de acesso
    const tokenResponse = await exchangeCodeForToken(code)

    if (!tokenResponse.success) {
      callbackUrl.searchParams.set("error", "token_failed")
      callbackUrl.searchParams.set("message", encodeURIComponent(tokenResponse.error ?? "Erro desconhecido"))
      return NextResponse.redirect(callbackUrl)
    }

    // Salva os tokens no banco de dados
    await saveTokensToDatabase(tokenResponse.data)

    // Redireciona para o dashboard com sucesso
    callbackUrl.searchParams.set("success", "true")
    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error("Erro no callback:", error)
    callbackUrl.searchParams.set("error", "callback_failed")
    callbackUrl.searchParams.set(
      "message",
      encodeURIComponent(error instanceof Error ? error.message : "Erro desconhecido"),
    )
    return NextResponse.redirect(callbackUrl)
  }
}

async function exchangeCodeForToken(code: string) {
  try {
    console.log("Trocando código por token...")
    console.log("Client ID:", CLIENT_ID ? "✓ OK" : "✗ MISSING")
    console.log("Client Secret:", CLIENT_SECRET ? "✓ OK" : "✗ MISSING")
    console.log("Redirect URI:", REDIRECT_URI)

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Credenciais do Bling não configuradas")
    }

    // Codificar credenciais em Base64 conforme RFC 6749
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")

    const formData = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    })

    console.log("Fazendo requisição para:", "https://www.bling.com.br/Api/v3/oauth/token")
    console.log("Body:", formData.toString())
    console.log("Authorization Header:", `Basic ${credentials}`) // Log the Authorization header

    const response = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      body: formData,
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro ao trocar código por token:", response.status, errorText)
      return {
        success: false,
        error: `Falha na troca do token: ${response.status}`,
      }
    }

    const tokenData = await response.json()
    console.log("Token obtido com sucesso")

    return {
      success: true,
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      },
    }
  } catch (error) {
    console.error("Erro na requisição de token:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

async function saveTokensToDatabase(tokenData: any) {
  try {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // Primeiro, tenta buscar informações do usuário usando o token
    const userInfo = await getUserInfo(tokenData.access_token)

    if (userInfo.success) {
      // Salva ou atualiza o usuário no banco
      await sql`
        INSERT INTO users (
          email, 
          name, 
          bling_access_token, 
          bling_refresh_token, 
          bling_token_expires_at,
          bling_user_id,
          created_at,
          updated_at
        ) VALUES (
          ${userInfo.data.email || "user@bling.com"}, 
          ${userInfo.data.name || "Usuário Bling"}, 
          ${tokenData.access_token}, 
          ${tokenData.refresh_token}, 
          ${expiresAt.toISOString()},
          ${userInfo.data.id || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (email) 
        DO UPDATE SET 
          bling_access_token = EXCLUDED.bling_access_token,
          bling_refresh_token = EXCLUDED.bling_refresh_token,
          bling_token_expires_at = EXCLUDED.bling_token_expires_at,
          bling_user_id = EXCLUDED.bling_user_id,
          updated_at = NOW()
      `

      console.log("Tokens salvos no banco com sucesso")
    } else {
      // Se não conseguir buscar info do usuário, salva apenas os tokens
      await sql`
        INSERT INTO users (
          email, 
          name, 
          bling_access_token, 
          bling_refresh_token, 
          bling_token_expires_at,
          created_at,
          updated_at
        ) VALUES (
          'user@bling.com', 
          'Usuário Bling', 
          ${tokenData.access_token}, 
          ${tokenData.refresh_token}, 
          ${expiresAt.toISOString()},
          NOW(),
          NOW()
        )
        ON CONFLICT (email) 
        DO UPDATE SET 
          bling_access_token = EXCLUDED.bling_access_token,
          bling_refresh_token = EXCLUDED.bling_refresh_token,
          bling_token_expires_at = EXCLUDED.bling_token_expires_at,
          updated_at = NOW()
      `
    }
  } catch (error) {
    console.error("Erro ao salvar tokens no banco:", error)
    throw error
  }
}
