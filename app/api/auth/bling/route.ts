import { NextResponse } from "next/server"
import { getBlingAuthUrl } from "@/lib/bling-auth"

export async function GET() {
  try {
    const authUrl = getBlingAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error("Erro ao gerar URL de autenticação:", error)
    return NextResponse.json({ error: "Failed to generate auth URL", message: error.message }, { status: 500 })
  }
}
