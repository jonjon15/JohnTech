import { NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { handleBlingApiError, createBlingApiResponse } from "@/lib/bling-error-handler"
import { saveWebhookLog } from "@/lib/db"

const userEmail = "admin@johntech.com"

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🔄 [${requestId}] POST /api/bling/sync - INÍCIO`)

    const token = await getValidAccessToken(userEmail)
    if (!token) {
      return NextResponse.json(handleBlingApiError(new Error("Token não encontrado"), "SYNC_DATA"), { status: 401 })
    }

    const { type, filters } = await request.json()
    console.log(`📋 [${requestId}] Tipo de sincronização: ${type}`, filters)

    const blingApiUrl = process.env.BLING_API_URL || "https://www.bling.com.br/Api/v3"
    const syncResults = {
      produtos: 0,
      pedidos: 0,
      contatos: 0,
      errors: [],
    }

    // Sincronizar produtos
    if (type === "all" || type === "produtos") {
      try {
        console.log(`📦 [${requestId}] Sincronizando produtos...`)

        const produtosResponse = await fetch(`${blingApiUrl}/produtos?limite=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "User-Agent": "BlingPro/1.0",
          },
        })

        if (produtosResponse.ok) {
          const produtosData = await produtosResponse.json()
          syncResults.produtos = produtosData.data?.length || 0
          console.log(`✅ [${requestId}] ${syncResults.produtos} produtos sincronizados`)
        } else {
          throw new Error(`Erro ao sincronizar produtos: ${produtosResponse.status}`)
        }
      } catch (error: any) {
        console.error(`❌ [${requestId}] Erro na sincronização de produtos:`, error)
        syncResults.errors.push(`Produtos: ${error.message}`)
      }
    }

    // Sincronizar pedidos
    if (type === "all" || type === "pedidos") {
      try {
        console.log(`🛒 [${requestId}] Sincronizando pedidos...`)

        const pedidosResponse = await fetch(`${blingApiUrl}/pedidos/vendas?limite=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "User-Agent": "BlingPro/1.0",
          },
        })

        if (pedidosResponse.ok) {
          const pedidosData = await pedidosResponse.json()
          syncResults.pedidos = pedidosData.data?.length || 0
          console.log(`✅ [${requestId}] ${syncResults.pedidos} pedidos sincronizados`)
        } else {
          throw new Error(`Erro ao sincronizar pedidos: ${pedidosResponse.status}`)
        }
      } catch (error: any) {
        console.error(`❌ [${requestId}] Erro na sincronização de pedidos:`, error)
        syncResults.errors.push(`Pedidos: ${error.message}`)
      }
    }

    // Sincronizar contatos
    if (type === "all" || type === "contatos") {
      try {
        console.log(`👥 [${requestId}] Sincronizando contatos...`)

        const contatosResponse = await fetch(`${blingApiUrl}/contatos?limite=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "User-Agent": "BlingPro/1.0",
          },
        })

        if (contatosResponse.ok) {
          const contatosData = await contatosResponse.json()
          syncResults.contatos = contatosData.data?.length || 0
          console.log(`✅ [${requestId}] ${syncResults.contatos} contatos sincronizados`)
        } else {
          throw new Error(`Erro ao sincronizar contatos: ${contatosResponse.status}`)
        }
      } catch (error: any) {
        console.error(`❌ [${requestId}] Erro na sincronização de contatos:`, error)
        syncResults.errors.push(`Contatos: ${error.message}`)
      }
    }

    // Salvar log da sincronização
    await saveWebhookLog(
      "sync_completed",
      requestId,
      {
        type,
        filters,
        results: syncResults,
        user_email: userEmail,
      },
      "completed",
    )

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Sincronização concluída em ${elapsedTime}ms`)

    return NextResponse.json(
      createBlingApiResponse(
        {
          sync_type: type,
          results: syncResults,
          total_synced: syncResults.produtos + syncResults.pedidos + syncResults.contatos,
          has_errors: syncResults.errors.length > 0,
        },
        elapsedTime,
        requestId,
      ),
    )
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [${requestId}] Erro na sincronização:`, error)

    return NextResponse.json(handleBlingApiError(error, "SYNC_DATA"), { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de sincronização do Bling",
    methods: ["POST"],
    parameters: {
      type: "all | produtos | pedidos | contatos",
      filters: "object (opcional)",
    },
    example: {
      type: "produtos",
      filters: {
        situacao: "Ativo",
        limite: 50,
      },
    },
  })
}
