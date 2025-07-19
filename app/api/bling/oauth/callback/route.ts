import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, saveTokens } from "@/lib/bling-auth"
import { createTablesIfNotExists } from "@/lib/db"

const userEmail = "admin@johntech.com"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] OAuth Callback - INÍCIO`)

    // Garantir que as tabelas existem
    await createTablesIfNotExists()

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    console.log(`📋 [${requestId}] Parâmetros:`, { code: !!code, state, error })

    if (error) {
      console.error(`❌ [${requestId}] Erro OAuth:`, error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/configuracao-bling?error=${error}`)
    }

    if (!code) {
      console.error(`❌ [${requestId}] Código não fornecido`)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/configuracao-bling?error=no_code`)
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const redirectUri = `${baseUrl}/api/bling/oauth/callback`

    console.log(`🔄 [${requestId}] Trocando código por tokens...`)
    const tokenData = await exchangeCodeForTokens(code, redirectUri)

    if (!tokenData) {
      console.error(`❌ [${requestId}] Falha na troca de tokens`)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/configuracao-bling?error=token_exchange_failed`)
    }

    console.log(`💾 [${requestId}] Salvando tokens para: ${userEmail}`)
    const saved = await saveTokens(userEmail, tokenData)

    const elapsedTime = Date.now() - startTime

    if (saved) {
      console.log(`✅ [${requestId}] OAuth concluído em ${elapsedTime}ms`)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/configuracao-bling?success=true`)
    } else {
      console.error(`❌ [${requestId}] Falha ao salvar tokens`)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/configuracao-bling?error=save_failed`)
    }
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro no callback:`, error)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/configuracao-bling?error=callback_error&details=${encodeURIComponent(error.message)}`,
    )
  }
}
