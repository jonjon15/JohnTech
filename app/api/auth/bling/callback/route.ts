import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, saveTokens } from "@/lib/bling-auth"
import { createTablesIfNotExists } from "@/lib/db"

const userEmail = process.env.BLING_USER_EMAIL || "admin@johntech.com"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] OAuth Callback - INÍCIO`)

    await createTablesIfNotExists()

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    console.log(`📋 [${requestId}] Parâmetros:`, { code: !!code, error, state })

    if (error) {
      console.error(`❌ [${requestId}] Erro OAuth:`, error)
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", error)
      errorUrl.searchParams.set("message", "Erro na autorização OAuth")
      return NextResponse.redirect(errorUrl)
    }

    if (!code) {
      console.error(`❌ [${requestId}] Código não fornecido`)
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", "missing_code")
      errorUrl.searchParams.set("message", "Código de autorização não fornecido")
      return NextResponse.redirect(errorUrl)
    }

    const redirectUri = new URL("/api/auth/bling/callback", request.nextUrl.origin).toString()
    console.log(`🔗 [${requestId}] Redirect URI:`, redirectUri)

    console.log(`🔄 [${requestId}] Trocando código por tokens...`)
    const tokenData = await exchangeCodeForTokens(code, redirectUri)

    if (!tokenData) {
      console.error(`❌ [${requestId}] Falha na troca de tokens`)
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", "token_exchange_failed")
      errorUrl.searchParams.set("message", "Falha ao obter tokens do Bling")
      return NextResponse.redirect(errorUrl)
    }

    console.log(`💾 [${requestId}] Salvando tokens para o usuário: ${userEmail}...`)
    const saved = await saveTokens(userEmail, tokenData)

    if (!saved) {
      console.error(`❌ [${requestId}] Falha ao salvar tokens`)
      const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
      errorUrl.searchParams.set("error", "save_failed")
      errorUrl.searchParams.set("message", "Falha ao salvar tokens no banco")
      return NextResponse.redirect(errorUrl)
    }

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] OAuth concluído em ${elapsedTime}ms para ${userEmail}`)

    const successUrl = new URL("/configuracao-bling", request.nextUrl.origin)
    successUrl.searchParams.set("success", "true")
    successUrl.searchParams.set("message", "Autenticação realizada com sucesso")
    successUrl.searchParams.set("elapsed_time", elapsedTime.toString())
    return NextResponse.redirect(successUrl)
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no callback OAuth:`, error)
    const errorUrl = new URL("/configuracao-bling", request.nextUrl.origin)
    errorUrl.searchParams.set("error", "internal_error")
    errorUrl.searchParams.set("message", error.message || "Erro interno no callback")
    errorUrl.searchParams.set("elapsed_time", elapsedTime.toString())
    return NextResponse.redirect(errorUrl)
  }
}
