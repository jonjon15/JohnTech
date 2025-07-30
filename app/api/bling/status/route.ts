import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError } from "@/lib/bling-error-handler"

export async function GET() {
  try {
    const userEmail = "admin@example.com"
    const envCheck = {
      CLIENT_ID: !!process.env.CLIENT_ID,
      CLIENT_SECRET: !!process.env.CLIENT_SECRET,
      BLING_API_URL: !!process.env.BLING_API_URL,
    }
    const token = await getValidAccessToken(userEmail)
    const hasValidToken = !!token
    let apiStatus = "no_token"
    if (token) {
      try {
        const response = await fetch(`${process.env.BLING_API_URL}/situacoes/modulos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        apiStatus = response.ok ? "connected" : `error_${response.status}`
      } catch (error) {
        apiStatus = "connection_error"
      }
    }
    return NextResponse.json({
      status: "ok",
      environment: envCheck,
      authentication: {
        hasToken: hasValidToken,
        apiStatus: apiStatus,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    const err = handleBlingApiError(error, "bling_status")
    return NextResponse.json(err, { status: 500 })
  }
}
