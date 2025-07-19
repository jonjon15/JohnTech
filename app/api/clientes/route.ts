import { type NextRequest, NextResponse } from "next/server"
import { getAllClientes, createCliente } from "@/lib/pedidos-db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/clientes", {})

    const clientes = await getAllClientes()

    return NextResponse.json({
      success: true,
      data: clientes,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao buscar clientes:`, error)
    return handleBlingError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/clientes", {})

    const body = await request.json()

    const cliente = await createCliente({
      bling_id: body.bling_id,
      nome: body.nome,
      email: body.email,
      telefone: body.telefone,
      celular: body.celular,
      documento: body.documento,
      tipo_pessoa: body.tipo_pessoa || "F",
      inscricao_estadual: body.inscricao_estadual,
      inscricao_municipal: body.inscricao_municipal,
      nome_fantasia: body.nome_fantasia,
      endereco_logradouro: body.endereco_logradouro,
      endereco_numero: body.endereco_numero,
      endereco_complemento: body.endereco_complemento,
      endereco_bairro: body.endereco_bairro,
      endereco_cep: body.endereco_cep,
      endereco_cidade: body.endereco_cidade,
      endereco_uf: body.endereco_uf,
      endereco_pais: body.endereco_pais || "Brasil",
      observacoes: body.observacoes,
      situacao: body.situacao || "Ativo",
    })

    return NextResponse.json({
      success: true,
      data: cliente,
      message: "Cliente criado com sucesso",
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao criar cliente:`, error)
    return handleBlingError(error, requestId)
  }
}
