import { type NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { createOrUpdateEstoque, getAllDepositos } from "@/lib/estoque-db"
import { getAllProducts } from "@/lib/db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

const BLING_API_BASE = "https://www.bling.com.br/Api/v3"

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "POST", "/api/bling/sync/estoque", {})

    const accessToken = await getValidAccessToken("admin@johntech.com")
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Token de acesso não disponível",
          requestId,
        },
        { status: 401 },
      )
    }

    // Buscar produtos e depósitos locais
    const [produtos, depositos] = await Promise.all([getAllProducts(), getAllDepositos()])

    let sincronizados = 0
    let erros = 0
    const detalhes = []

    // Sincronizar estoque para cada produto
    for (const produto of produtos) {
      if (!produto.bling_id) continue

      try {
        // Buscar estoque no Bling
        const response = await fetch(`${BLING_API_BASE}/estoques?idsProdutos[]=${produto.bling_id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao buscar estoque do produto ${produto.bling_id}`)
        }

        const data = await response.json()

        if (data.data && data.data.length > 0) {
          for (const estoqueItem of data.data) {
            // Encontrar depósito correspondente
            const deposito = depositos.find((d) => d.bling_id === estoqueItem.deposito?.id) || depositos[0]

            await createOrUpdateEstoque({
              produto_id: produto.id!,
              deposito_id: deposito.id!,
              bling_produto_id: produto.bling_id,
              bling_deposito_id: estoqueItem.deposito?.id,
              quantidade_fisica: estoqueItem.saldoFisicoTotal || 0,
              quantidade_virtual: estoqueItem.saldoVirtualTotal || 0,
              quantidade_disponivel: estoqueItem.saldoVirtualDisponivel || 0,
              custo_medio: 0, // Bling não retorna custo no endpoint de estoque
              valor_total: 0,
            })

            sincronizados++
          }
        }

        detalhes.push({
          produto_id: produto.id,
          produto_nome: produto.nome,
          bling_id: produto.bling_id,
          status: "sucesso",
        })
      } catch (error: any) {
        erros++
        detalhes.push({
          produto_id: produto.id,
          produto_nome: produto.nome,
          bling_id: produto.bling_id,
          status: "erro",
          erro: error.message,
        })
        console.error(`Erro ao sincronizar estoque do produto ${produto.id}:`, error)
      }

      // Pequena pausa para não sobrecarregar a API
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      success: true,
      data: {
        produtos_processados: produtos.length,
        sincronizados,
        erros,
        detalhes,
      },
      message: `Sincronização concluída: ${sincronizados} itens sincronizados, ${erros} erros`,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro na sincronização de estoque:`, error)
    return handleBlingError(error, requestId)
  }
}
