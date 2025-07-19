import { NextResponse } from "next/server"

export async function POST() {
  try {
    const webhookSecret = process.env.BLING_WEBHOOK_SECRET

    if (!webhookSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "BLING_WEBHOOK_SECRET não configurado",
        },
        { status: 500 },
      )
    }

    // Simula um webhook de teste
    const testPayload = {
      evento: "teste.webhook",
      dados: {
        id: "123",
        nome: "Teste de Webhook",
        timestamp: new Date().toISOString(),
      },
      ocorrencia: new Date().toISOString(),
    }

    console.log("🧪 Teste de webhook executado:", testPayload)

    return NextResponse.json({
      success: true,
      message: "Webhook testado com sucesso",
      payload: testPayload,
      secretConfigured: true,
    })
  } catch (error) {
    console.error("Erro no teste de webhook:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Falha no teste de webhook",
      },
      { status: 500 },
    )
  }
}
