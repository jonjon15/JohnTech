import { type NextRequest, NextResponse } from "next/server"
import { getBlingApiClient } from "@/lib/bling-api-client"
import { createOrUpdateEstoque, getAllDepositos, criarAlertaEstoque } from "@/lib/estoque-db"
import { getAllProducts } from "@/lib/db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"
import type { SyncEstoqueResult } from "@/types/estoque"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/bling/sync/estoque", {})

    const blingClient = await getBlingApiClient()
    if (!blingClient) {
      throw new Error("Cliente Bling não configurado")
    }

    const produtos = await getAllProducts()
    const depositos = await getAllDepositos()
    const depositoPadrao = depositos.find((d) => d.padrao) || depositos[0]

    if (!depositoPadrao) {
      throw new Error("Nenhum depósito configurado")
    }

    const result: SyncEstoqueResult = {
      success: true,
      processados: 0,
      sincronizados: 0,
      erros: 0,
      alertas_criados: 0,
      detalhes: [],
    }

    for (const produto of produtos) {
      try {
        result.processados++

        if (!produto.bling_id) {
          result.detalhes.push({
            produto_id: produto.id,
            produto_nome: produto.nome,
            status: "erro",
            erro: "Produto não possui ID do Bling",
          })
          result.erros++
          continue
        }

        // Buscar estoque no Bling
        const estoqueResponse = await blingClient.get(`/estoques/${produto.bling_id}`)
        const estoqueData = estoqueResponse.data?.data

        if (!estoqueData) {
          result.detalhes.push({
            produto_id: produto.id,
            produto_nome: produto.nome,
            status: "erro",
            erro: "Estoque não encontrado no Bling",
          })
          result.erros++
          continue
        }

        // Atualizar estoque local
        const estoqueItem = {
          produto_id: produto.id,
          deposito_id: depositoPadrao.id,
          bling_produto_id: produto.bling_id,
          bling_deposito_id: estoqueData.deposito?.id,
          quantidade_fisica: Number.parseFloat(estoqueData.saldoFisico || "0"),
          quantidade_virtual: Number.parseFloat(estoqueData.saldoVirtual || "0"),
          quantidade_disponivel: Number.parseFloat(estoqueData.saldo || "0"),
          quantidade_minima: Number.parseFloat(estoqueData.saldoMinimo || "0"),
          custo_medio: Number.parseFloat(produto.preco || "0"),
          valor_total: Number.parseFloat(estoqueData.saldo || "0") * Number.parseFloat(produto.preco || "0"),
        }

        await createOrUpdateEstoque(estoqueItem)

        // Verificar alertas
        const quantidade = estoqueItem.quantidade_disponivel
        const minimo = estoqueItem.quantidade_minima || 0

        if (quantidade < 0) {
          await criarAlertaEstoque({
            produto_id: produto.id,
            deposito_id: depositoPadrao.id,
            tipo_alerta: "ESTOQUE_NEGATIVO",
            quantidade_atual: quantidade,
            quantidade_minima: minimo,
            data_alerta: new Date(),
            resolvido: false,
          })
          result.alertas_criados++
        } else if (quantidade === 0) {
          await criarAlertaEstoque({
            produto_id: produto.id,
            deposito_id: depositoPadrao.id,
            tipo_alerta: "ESTOQUE_ZERADO",
            quantidade_atual: quantidade,
            quantidade_minima: minimo,
            data_alerta: new Date(),
            resolvido: false,
          })
          result.alertas_criados++
        } else if (minimo > 0 && quantidade <= minimo) {
          await criarAlertaEstoque({
            produto_id: produto.id,
            deposito_id: depositoPadrao.id,
            tipo_alerta: "ESTOQUE_BAIXO",
            quantidade_atual: quantidade,
            quantidade_minima: minimo,
            data_alerta: new Date(),
            resolvido: false,
          })
          result.alertas_criados++
        }

        result.detalhes.push({
          produto_id: produto.id,
          produto_nome: produto.nome,
          status: "sucesso",
        })
        result.sincronizados++
      } catch (error) {
        console.error(`Erro ao sincronizar produto ${produto.id}:`, error)
        result.detalhes.push({
          produto_id: produto.id,
          produto_nome: produto.nome,
          status: "erro",
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        })
        result.erros++
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Sincronização concluída: ${result.sincronizados} produtos sincronizados, ${result.erros} erros, ${result.alertas_criados} alertas criados`,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro na sincronização de estoque:`, error)
    return handleBlingError(error, requestId)
  }
}
