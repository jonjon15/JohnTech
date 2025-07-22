import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ProdutoSchema } from "../route"
import crypto from "crypto"
import { getProduct, updateProduct, removeProduct, type BlingProduct } from "@/lib/db"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

// Schema de validação aprimorado para homologação
const ProdutoHomologacaoSchema = ProdutoSchema.extend({
  // Campos obrigatórios conforme documentação Bling
  nome: z.string().min(1, "Nome é obrigatório").max(120, "Nome deve ter no máximo 120 caracteres"),
  codigo: z.string().optional(),
  preco: z.number().min(0, "Preço deve ser positivo").optional(),
  descricao: z.string().optional(),
  situacao: z.enum(["A", "I"]).optional(), // A = Ativo, I = Inativo
  unidade: z.string().optional(),
  pesoLiquido: z.number().min(0).optional(),
  pesoBruto: z.number().min(0).optional(),
  volumes: z.number().int().min(0).optional(),
  itensPorCaixa: z.number().int().min(0).optional(),
  gtin: z.string().optional(),
  gtinEmbalagem: z.string().optional(),
  tipoProducao: z.enum(["P", "T", "I"]).optional(), // P = Própria, T = Terceiros, I = Insumo
  condicao: z.enum(["0", "1", "2", "3", "4", "5"]).optional(), // Condição do produto
  freteGratis: z.boolean().optional(),
  marca: z.string().optional(),
  descricaoCurta: z.string().max(255).optional(),
  descricaoComplementar: z.string().optional(),
  linkExterno: z.string().url().optional(),
  observacoes: z.string().optional(),
  categoria: z.object({
    id: z.number().optional()
  }).optional(),
  estoque: z.object({
    minimo: z.number().min(0).optional(),
    maximo: z.number().min(0).optional(),
    crossdocking: z.number().min(0).optional(),
    localizacao: z.string().optional()
  }).optional(),
  actionEstoque: z.enum(["A", "S", "T"]).optional(), // A = Alterar, S = Somar, T = Tirar
  tributacao: z.object({
    origem: z.enum(["0", "1", "2", "3", "4", "5", "6", "7", "8"]).optional(),
    nFCI: z.string().optional(),
    ncm: z.string().optional(),
    cest: z.string().optional(),
    codigoListaServicos: z.string().optional(),
    spedTipoItem: z.enum(["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "99"]).optional(),
    codigoItem: z.string().optional(),
    percentualTributos: z.number().min(0).max(100).optional(),
    valorBaseStRetido: z.number().min(0).optional(),
    valorStRetido: z.number().min(0).optional(),
    valorICMSSubstituto: z.number().min(0).optional(),
    codigoBeneficioFiscalUF: z.string().optional(),
    tipoItemSped: z.string().optional(),
    codigoNCMEx: z.string().optional()
  }).optional()
})

function parseId(raw: string): number {
  const id = Number.parseInt(raw, 10)
  if (Number.isNaN(id) || id <= 0) {
    throw new Error("ID deve ser um número inteiro positivo")
  }
  return id
}

// Função para validar rate limits (conforme limites Bling: 3 req/seg, 120k req/dia)
function checkRateLimit(req: NextRequest): boolean {
  // Implementar lógica de rate limiting aqui se necessário
  // Bling permite: 3 requisições/segundo, 120.000 requisições/dia
  return true
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()
  
  try {
    // Validação de rate limit
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        handleBlingApiError("Rate limit excedido", "TOO_MANY_REQUESTS"), 
        { status: 429 }
      )
    }

    const id = parseId(context.params.id)
    const produto = await getProduct(id)
    
    if (!produto) {
      const elapsed = Date.now() - t0
      logBlingApiCall("GET", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, false)
      return NextResponse.json(
        handleBlingApiError("Produto não encontrado", "RESOURCE_NOT_FOUND"), 
        { status: 404 }
      )
    }

    const elapsed = Date.now() - t0
    logBlingApiCall("GET", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, true)
    
    // Formato de resposta compatível com padrão Bling
    return NextResponse.json(
      createBlingApiResponse(
        { 
          data: produto,
          // Metadados adicionais para homologação
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: "v3"
          }
        }, 
        elapsed, 
        requestId
      )
    )

  } catch (err: any) {
    const elapsed = Date.now() - t0
    logBlingApiCall("GET", `/api/bling/homologacao/produtos/error`, requestId, elapsed, false)
    
    const statusCode = err.message?.includes("ID deve ser") ? 400 : 500
    const errorType = statusCode === 400 ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR"
    
    return NextResponse.json(
      handleBlingApiError(err, errorType), 
      { status: statusCode }
    )
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()
  let id: number | undefined = undefined

  try {
    // Validação de rate limit
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        handleBlingApiError("Rate limit excedido", "TOO_MANY_REQUESTS"), 
        { status: 429 }
      )
    }

    const params = await context.params;
    id = parseId(params.id)
    const body = await req.json()
    
    // Validação mais rigorosa para homologação
    const parsed = ProdutoHomologacaoSchema.parse(body)
    
    // Verificar se produto existe antes de atualizar
    const produtoExistente = await getProduct(id)
    if (!produtoExistente) {
      const elapsed = Date.now() - t0
      logBlingApiCall("PUT", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, false)
      return NextResponse.json(
        handleBlingApiError("Produto não encontrado para atualização", "RESOURCE_NOT_FOUND"), 
        { status: 404 }
      )
    }

    // Adaptar estoque para o formato esperado pelo banco (number | null | undefined)
    let estoqueValue: number | null | undefined = undefined
    if (parsed.estoque) {
      // Use 'minimo' como valor principal de estoque, ou adapte conforme sua regra de negócio
      estoqueValue = typeof parsed.estoque.minimo === "number" ? parsed.estoque.minimo : null
    }

    const updated = await updateProduct(id, { ...parsed, estoque: estoqueValue })
    const elapsed = Date.now() - t0
    logBlingApiCall("PUT", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, true)
    
    return NextResponse.json(
      createBlingApiResponse(
        { 
          data: updated, 
          message: "Produto atualizado com sucesso",
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            operation: "update",
            resourceId: id
          }
        }, 
        elapsed, 
        requestId
      )
    )

  } catch (err: any) {
    const elapsed = Date.now() - t0
    const idLog = typeof id === "number" ? id : "unknown"
    logBlingApiCall("PUT", `/api/bling/homologacao/produtos/${idLog}`, requestId, elapsed, false)

    if (err instanceof z.ZodError) {
      return NextResponse.json({
        error: {
          type: "VALIDATION_ERROR",
          message: "Dados de entrada inválidos",
          details: err.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            code: error.code
          })),
          requestId,
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    const statusCode = err.message?.includes("ID deve ser") ? 400 : 500
    const errorType = statusCode === 400 ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR"
    
    return NextResponse.json(
      handleBlingApiError(err, errorType), 
      { status: statusCode }
    )
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    // Validação de rate limit
    if (!checkRateLimit(req)) {
      return NextResponse.json(
        handleBlingApiError("Rate limit excedido", "TOO_MANY_REQUESTS"), 
        { status: 429 }
      )
    }

    const params = await context.params;
    const id = parseId(params.id)
    
    // Verificar se produto existe antes de deletar
    const produtoExistente = await getProduct(id)
    if (!produtoExistente) {
      const elapsed = Date.now() - t0
      logBlingApiCall("DELETE", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, false)
      return NextResponse.json(
        handleBlingApiError("Produto não encontrado para exclusão", "RESOURCE_NOT_FOUND"), 
        { status: 404 }
      )
    }

    const success = await removeProduct(id)
    if (!success) {
      throw new Error("Falha ao remover produto do banco de dados")
    }

    const elapsed = Date.now() - t0
    logBlingApiCall("DELETE", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, true)
    
    return NextResponse.json(
      createBlingApiResponse(
        { 
          data: { 
            id, 
            deleted: true,
            message: "Produto removido com sucesso" 
          },
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            operation: "delete"
          }
        }, 
        elapsed, 
        requestId
      )
    )

  } catch (err: any) {
    const elapsed = Date.now() - t0
    logBlingApiCall("DELETE", `/api/bling/homologacao/produtos/error`, requestId, elapsed, false)
    
    const statusCode = err.message?.includes("ID deve ser") ? 400 : 500
    const errorType = statusCode === 400 ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR"
    
    return NextResponse.json(
      handleBlingApiError(err, errorType), 
      { status: statusCode }
    )
  }
}