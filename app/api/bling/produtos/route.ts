import { type NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/bling-auth"
import { z } from "zod"

const BLING_API_BASE = "https://www.bling.com.br/Api/v3"

// Schema de validação baseado na documentação Bling
const produtoSchema = z.object({
  nome: z.string().min(1).max(120),
  codigo: z.string().optional(),
  preco: z.number().positive().optional(),
  tipo: z.enum(["P", "S"]).default("P"), // P = Produto, S = Serviço
  situacao: z.enum(["A", "I"]).default("A"), // A = Ativo, I = Inativo
  formato: z.enum(["S", "V", "U"]).default("S"), // S = Simples, V = Variação, U = Unidade
  descricaoCurta: z.string().max(256).optional(),
  descricaoComplementar: z.string().optional(),
  unidade: z.string().max(6).optional(),
  pesoLiquido: z.number().positive().optional(),
  pesoBruto: z.number().positive().optional(),
  volumes: z.number().int().positive().optional(),
  itensPorCaixa: z.number().int().positive().optional(),
  gtin: z.string().max(14).optional(),
  gtinEmbalagem: z.string().max(14).optional(),
  tipoProducao: z.enum(["P", "T"]).optional(), // P = Própria, T = Terceiros
  condicao: z.enum([0, 1, 2, 3, 4, 5]).optional(), // 0 = Não especificado, 1 = Novo, etc.
  freteGratis: z.boolean().default(false),
  marca: z.string().max(30).optional(),
  descricaoFornecedor: z.string().max(255).optional(),
  categoria: z
    .object({
      id: z.number().int().positive(),
    })
    .optional(),
  estoque: z
    .object({
      minimo: z.number().nonnegative().optional(),
      maximo: z.number().nonnegative().optional(),
      crossdocking: z.number().int().optional(),
      localizacao: z.string().max(10).optional(),
    })
    .optional(),
  actionEstoque: z.enum(["A", "S", "T"]).optional(), // A = Alterar, S = Somar, T = Subtrair
  tributacao: z
    .object({
      origem: z.enum([0, 1, 2, 3, 4, 5, 6, 7, 8]).optional(),
      nfci: z.string().max(2).optional(),
      ncm: z.string().max(8).optional(),
      cest: z.string().max(7).optional(),
      codigoListaServicos: z.string().max(5).optional(),
      spedTipoItem: z.enum(["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "99"]).optional(),
      codigoItem: z.string().max(60).optional(),
      percentualTributos: z.number().min(0).max(100).optional(),
      valorBaseStRetencao: z.number().nonnegative().optional(),
      valorStRetencao: z.number().nonnegative().optional(),
      valorICMSSubstituto: z.number().nonnegative().optional(),
      codigoBeneficioFiscal: z.string().max(10).optional(),
    })
    .optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = Math.max(1, Number.parseInt(searchParams.get("pagina") || "1"))
    const limite = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limite") || "20")))
    const criterio = searchParams.get("criterio") || "1" // 1 = ID, 2 = Código, 3 = Descrição
    const tipo = searchParams.get("tipo") // P = Produto, S = Serviço
    const situacao = searchParams.get("situacao") // A = Ativo, I = Inativo
    const codigo = searchParams.get("codigo")
    const nome = searchParams.get("nome")
    const idCategoria = searchParams.get("idCategoria")

    const accessToken = await getValidAccessToken("admin@johntech.com")
    if (!accessToken) {
      return NextResponse.json({ error: "Token de acesso não disponível" }, { status: 401 })
    }

    const url = new URL(`${BLING_API_BASE}/produtos`)
    url.searchParams.set("pagina", pagina.toString())
    url.searchParams.set("limite", limite.toString())
    url.searchParams.set("criterio", criterio)

    if (tipo) url.searchParams.set("tipo", tipo)
    if (situacao) url.searchParams.set("situacao", situacao)
    if (codigo) url.searchParams.set("codigo", codigo)
    if (nome) url.searchParams.set("nome", nome)
    if (idCategoria) url.searchParams.set("idCategoria", idCategoria)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (response.status === 401) {
      // Token expirado, tentar renovar
      const newToken = await getValidAccessToken("admin@johntech.com", true)
      if (newToken) {
        const retryResponse = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${newToken}`,
            Accept: "application/json",
          },
        })

        if (retryResponse.ok) {
          const data = await retryResponse.json()
          return NextResponse.json(data)
        }
      }

      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Erro na API Bling:", response.status, errorData)
      return NextResponse.json(
        {
          error: "Erro ao buscar produtos",
          details: errorData,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    // Padroniza para sempre retornar { produtos: [...] }
    let produtos: any[] = [];
    if (Array.isArray(data)) {
      produtos = data;
    } else if (Array.isArray(data.produtos)) {
      produtos = data.produtos;
    } else if (data.data && Array.isArray(data.data)) {
      produtos = data.data;
    } else if (data.retorno && Array.isArray(data.retorno.produtos)) {
      produtos = data.retorno.produtos;
    }
    else if (data && typeof data === 'object') {
      // Tenta extrair array de produtos de outros formatos
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          produtos = data[key];
          break;
        }
      }
    }
    return NextResponse.json({ produtos })
  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados do produto
    const validatedData = produtoSchema.parse(body)

    const accessToken = await getValidAccessToken("admin@johntech.com")
    if (!accessToken) {
      return NextResponse.json({ error: "Token de acesso não disponível" }, { status: 401 })
    }

    const response = await fetch(`${BLING_API_BASE}/produtos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    })

    if (response.status === 401) {
      const newToken = await getValidAccessToken("admin@johntech.com", true)
      if (newToken) {
        const retryResponse = await fetch(`${BLING_API_BASE}/produtos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${newToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        })

        if (retryResponse.ok) {
          const data = await retryResponse.json()
          return NextResponse.json(data, { status: 201 })
        }
      }

      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Erro ao criar produto:", response.status, errorData)
      return NextResponse.json(
        {
          error: "Erro ao criar produto",
          details: errorData,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    console.error("Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
