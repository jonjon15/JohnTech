import { type NextRequest, NextResponse } from "next/server"
import { criarAlertaSistema, marcarAlertaComoLido, resolverAlerta } from "@/lib/analytics-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/analytics/alertas", {})

    const body = await request.json()

    const alerta = await criarAlertaSistema({
      tipo: body.tipo,
      titulo: body.titulo,
      descricao: body.descricao,
      severidade: body.severidade || "INFO",
      lido: false,
      resolvido: false,
      usuario_responsavel: body.usuario_responsavel,
      metadados: body.metadados,
    })

    return NextResponse.json({
      success: true,
      data: alerta,
      message: "Alerta criado com sucesso",
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao criar alerta:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "PATCH", "/api/analytics/alertas", {})

    const body = await request.json()
    const { id, acao, usuario } = body

    let success = false
    let message = ""

    if (acao === "marcar_lido") {
      success = await marcarAlertaComoLido(id)
      message = "Alerta marcado como lido"
    } else if (acao === "resolver") {
      success = await resolverAlerta(id, usuario)
      message = "Alerta resolvido"
    }

    if (!success) {
      throw new Error("Falha ao atualizar alerta")
    }

    return NextResponse.json({
      success: true,
      message,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao atualizar alerta:`, error)
    return handleBlingError(error, requestId)
  }
}
