import { type NextRequest, NextResponse } from "next/server"
import { getAllDepositos, createDeposito } from "@/lib/estoque-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/estoque/depositos", {})

    const depositos = await getAllDepositos()

    return NextResponse.json({
      success: true,
      data: depositos,
      total: depositos.length,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar depósitos:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    const body = await request.json()
    logRequest(requestId, "POST", "/api/estoque/depositos", body)

    if (!body.nome) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome do depósito é obrigatório",
          requestId,
        },
        { status: 400 },
      )
    }

    const deposito = await createDeposito({
      bling_id: body.bling_id,
      nome: body.nome,
      descricao: body.descricao,
      endereco: body.endereco,
      ativo: body.ativo !== undefined ? body.ativo : true,
      padrao: body.padrao !== undefined ? body.padrao : false,
    })

    return NextResponse.json(
      {
        success: true,
        data: deposito,
        message: "Depósito criado com sucesso",
        requestId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(`[${requestId}] Erro ao criar depósito:`, error)
    return handleBlingError(error, requestId)
  }
}
