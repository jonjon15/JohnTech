import { getValidAccessToken } from "./bling-auth"
import { createOrUpdateEstoque, criarAlertaEstoque, getAllDepositos } from "./estoque-db"
import { getAllProducts } from "./db"

const BLING_API_BASE = "https://www.bling.com.br/Api/v3"

export interface SyncEstoqueResult {
  success: boolean
  processados: number
  sincronizados: number
  erros: number
  alertas_criados: number
  detalhes: Array<{
    produto_id: number
    produto_nome: string
    status: "sucesso" | "erro"
    erro?: string
  }>
}

export async function syncEstoqueFromBling(): Promise<SyncEstoqueResult> {
  const result: SyncEstoqueResult = {
    success: false,
    processados: 0,
    sincronizados: 0,
    erros: 0,
    alertas_criados: 0,
    detalhes: [],
  }

  try {
    const accessToken = await getValidAccessToken("admin@johntech.com")
    if (!accessToken) {
      throw new Error("Token de acesso não disponível")
    }

    const [produtos, depositos] = await Promise.all([getAllProducts(), getAllDepositos()])

    const depositoPadrao = depositos.find((d) => d.padrao) || depositos[0]
    if (!depositoPadrao) {
      throw new Error("Nenhum depósito encontrado")
    }

    for (const produto of produtos) {
      result.processados++

      if (!produto.bling_id) {
        result.detalhes.push({
          produto_id: produto.id!,
          produto_nome: produto.nome,
          status: "erro",
          erro: "Produto não possui ID do Bling",
        })
        result.erros++
        continue
      }

      try {
        // Buscar estoque no Bling
        const response = await fetch(`${BLING_API_BASE}/estoques?idsProdutos[]=${produto.bling_id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status} na API do Bling`)
        }

        const data = await response.json()

        if (data.data && data.data.length > 0) {
          for (const estoqueItem of data.data) {
            // Encontrar depósito correspondente ou usar o padrão
            const deposito = depositos.find((d) => d.bling_id === estoqueItem.deposito?.id) || depositoPadrao

            const estoqueData = {
              produto_id: produto.id!,
              deposito_id: deposito.id!,
              bling_produto_id: produto.bling_id,
              bling_deposito_id: estoqueItem.deposito?.id || null,
              quantidade_fisica: Number.parseFloat(estoqueItem.saldoFisicoTotal || "0"),
              quantidade_virtual: Number.parseFloat(estoqueItem.saldoVirtualTotal || "0"),
              quantidade_disponivel: Number.parseFloat(estoqueItem.saldoVirtualDisponivel || "0"),
              custo_medio: 0, // Bling não retorna custo no endpoint de estoque
              valor_total: 0,
            }

            await createOrUpdateEstoque(estoqueData)

            // Verificar se precisa criar alertas
            const quantidadeDisponivel = estoqueData.quantidade_disponivel
            const quantidadeMinima = produto.quantidade_minima || 0

            if (quantidadeDisponivel < 0) {
              await criarAlertaEstoque({
                produto_id: produto.id!,
                deposito_id: deposito.id!,
                tipo_alerta: "ESTOQUE_NEGATIVO",
                quantidade_atual: quantidadeDisponivel,
                quantidade_minima: quantidadeMinima,
                data_alerta: new Date(),
                resolvido: false,
              })
              result.alertas_criados++
            } else if (quantidadeDisponivel === 0) {
              await criarAlertaEstoque({
                produto_id: produto.id!,
                deposito_id: deposito.id!,
                tipo_alerta: "ESTOQUE_ZERADO",
                quantidade_atual: quantidadeDisponivel,
                quantidade_minima: quantidadeMinima,
                data_alerta: new Date(),
                resolvido: false,
              })
              result.alertas_criados++
            } else if (quantidadeMinima > 0 && quantidadeDisponivel <= quantidadeMinima) {
              await criarAlertaEstoque({
                produto_id: produto.id!,
                deposito_id: deposito.id!,
                tipo_alerta: "ESTOQUE_BAIXO",
                quantidade_atual: quantidadeDisponivel,
                quantidade_minima: quantidadeMinima,
                data_alerta: new Date(),
                resolvido: false,
              })
              result.alertas_criados++
            }
          }

          result.sincronizados++
          result.detalhes.push({
            produto_id: produto.id!,
            produto_nome: produto.nome,
            status: "sucesso",
          })
        } else {
          // Produto sem estoque no Bling, criar com quantidade zero
          await createOrUpdateEstoque({
            produto_id: produto.id!,
            deposito_id: depositoPadrao.id!,
            bling_produto_id: produto.bling_id,
            bling_deposito_id: null,
            quantidade_fisica: 0,
            quantidade_virtual: 0,
            quantidade_disponivel: 0,
            custo_medio: 0,
            valor_total: 0,
          })

          result.sincronizados++
          result.detalhes.push({
            produto_id: produto.id!,
            produto_nome: produto.nome,
            status: "sucesso",
          })
        }
      } catch (error: any) {
        result.erros++
        result.detalhes.push({
          produto_id: produto.id!,
          produto_nome: produto.nome,
          status: "erro",
          erro: error.message,
        })
        console.error(`Erro ao sincronizar produto ${produto.id}:`, error)
      }

      // Pausa para não sobrecarregar a API
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    result.success = result.erros === 0 || result.sincronizados > 0
    return result
  } catch (error: any) {
    console.error("Erro na sincronização de estoque:", error)
    result.success = false
    return result
  }
}

export async function updateEstoqueInBling(
  produtoId: number,
  depositoId: number,
  quantidade: number,
  operacao: "B" | "S" | "T" = "B", // B=Balanço, S=Saída, T=Transferência
): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken("admin@johntech.com")
    if (!accessToken) {
      throw new Error("Token de acesso não disponível")
    }

    // Buscar dados do produto e depósito
    const [produtos, depositos] = await Promise.all([getAllProducts(), getAllDepositos()])

    const produto = produtos.find((p) => p.id === produtoId)
    const deposito = depositos.find((d) => d.id === depositoId)

    if (!produto?.bling_id || !deposito?.bling_id) {
      throw new Error("Produto ou depósito não possui ID do Bling")
    }

    const updateData = {
      estoques: [
        {
          produto: {
            id: produto.bling_id,
          },
          deposito: {
            id: deposito.bling_id,
          },
          operacao,
          quantidade,
          preco: 0, // Preço será mantido
          custo: 0, // Custo será mantido
        },
      ],
    }

    const response = await fetch(`${BLING_API_BASE}/estoques`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Erro ${response.status}: ${errorData.message || "Erro na API do Bling"}`)
    }

    return true
  } catch (error) {
    console.error("Erro ao atualizar estoque no Bling:", error)
    throw error
  }
}
