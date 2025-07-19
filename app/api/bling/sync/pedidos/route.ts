import { type NextRequest, NextResponse } from "next/server"
import { getBlingApiClient } from "@/lib/bling-api-client"
import { createCliente, getClienteByBlingId, createPedido } from "@/lib/pedidos-db"
import { getProductByBlingId } from "@/lib/db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/bling/sync/pedidos", {})

    const blingClient = await getBlingApiClient()
    if (!blingClient) {
      throw new Error("Cliente Bling não configurado")
    }

    // Buscar pedidos do Bling
    const response = await blingClient.get("/pedidos/vendas", {
      params: {
        limite: 100,
        situacao: 6, // Em aberto
      },
    })

    const pedidosBling = response.data?.data || []
    let processados = 0
    let sincronizados = 0
    let erros = 0

    for (const pedidoBling of pedidosBling) {
      try {
        processados++

        // Verificar se pedido já existe
        // (implementar verificação por bling_id)

        // Processar cliente
        let cliente = null
        if (pedidoBling.contato?.id) {
          cliente = await getClienteByBlingId(pedidoBling.contato.id)

          if (!cliente) {
            // Criar cliente
            cliente = await createCliente({
              bling_id: pedidoBling.contato.id,
              nome: pedidoBling.contato.nome || "Cliente Importado",
              email: pedidoBling.contato.email,
              telefone: pedidoBling.contato.telefone,
              documento: pedidoBling.contato.numeroDocumento,
              tipo_pessoa: pedidoBling.contato.tipoPessoa === "J" ? "J" : "F",
              situacao: "Ativo",
            })
          }
        }

        // Processar itens
        const itens = []
        for (const itemBling of pedidoBling.itens || []) {
          let produto = null
          if (itemBling.produto?.id) {
            produto = await getProductByBlingId(itemBling.produto.id)
          }

          itens.push({
            produto_id: produto?.id,
            codigo_produto: itemBling.produto?.codigo,
            nome_produto: itemBling.produto?.nome || itemBling.descricao,
            quantidade: Number.parseFloat(itemBling.quantidade || "1"),
            valor_unitario: Number.parseFloat(itemBling.valor || "0"),
            valor_desconto: Number.parseFloat(itemBling.desconto || "0"),
          })
        }

        // Criar pedido
        await createPedido({
          cliente: cliente ? { id: cliente.id } : { nome: "Cliente Importado" },
          data_pedido: new Date(pedidoBling.data),
          data_prevista: pedidoBling.dataPrevisao ? new Date(pedidoBling.dataPrevisao) : undefined,
          observacoes: pedidoBling.observacoes,
          vendedor: pedidoBling.vendedor?.nome,
          forma_pagamento: pedidoBling.transporte?.fretePorConta,
          itens,
        })

        sincronizados++
      } catch (error) {
        console.error(`Erro ao sincronizar pedido ${pedidoBling.id}:`, error)
        erros++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processados,
        sincronizados,
        erros,
      },
      message: `Sincronização concluída: ${sincronizados} pedidos sincronizados, ${erros} erros`,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro na sincronização de pedidos:`, error)
    return handleBlingError(error, requestId)
  }
}
