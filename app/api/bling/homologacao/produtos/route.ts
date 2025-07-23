import { listProducts, createProduct, removeProduct } from "@/lib/db"
import { z } from "zod"

// GET: Lista todos os produtos de homologação
export async function GET(req: NextRequest) {
  try {
    const produtos = await listProducts()
    const res = NextResponse.json({ data: produtos, message: "Produtos listados com sucesso" })
    const homologacaoHeader = req.headers.get('x-bling-homologacao')
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  } catch (error) {
    const res = NextResponse.json({ error: "Erro ao listar produtos" }, { status: 500 })
    const homologacaoHeader = req.headers.get('x-bling-homologacao')
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  }
}

// Esquema de validação zod para produto
export const ProdutoSchema = z.object({
  nome: z.string(),
  codigo: z.string(),
  preco: z.number(),
  descricao_curta: z.string().nullable().optional(),
  situacao: z.string().optional().default("Ativo"),
  tipo: z.string().optional().default("P"),
  formato: z.string().optional().default("S"),
  bling_id: z.string().nullable().optional(),
  estoque: z.number().optional().default(0),
});

// POST: Cria um novo produto de homologação
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProdutoSchema.parse(body);
    // Garantir que descricao_curta e bling_id nunca sejam undefined
    const produto = await createProduct({
      ...parsed,
      descricao_curta: parsed.descricao_curta ?? null,
      bling_id: parsed.bling_id ?? null,
    });
    const res = NextResponse.json({ data: produto, message: "Produto criado com sucesso" }, { status: 201 })
    const homologacaoHeader = req.headers.get('x-bling-homologacao')
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  } catch (err: any) {
    const message = err instanceof z.ZodError ? err.errors : err.message;
    const res = NextResponse.json({ error: "Erro ao criar produto", details: message }, { status: 400 })
    const homologacaoHeader = req.headers.get('x-bling-homologacao')
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  }
}

// DELETE: Remove um produto de homologação (por id via query param)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const homologacaoHeader = req.headers.get('x-bling-homologacao')
  if (!id) {
    const res = NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  }
  try {
    const ok = await removeProduct(Number(id))
    if (!ok) {
      const res = NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
      if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
      return res
    }
    const res = NextResponse.json({ success: true, message: "Produto removido com sucesso" })
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  } catch (error) {
    const res = NextResponse.json({ error: "Erro ao remover produto" }, { status: 500 })
    if (homologacaoHeader) res.headers.set('x-bling-homologacao', homologacaoHeader)
    return res
  }
}
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getProduct, updateProduct } from "@/lib/db"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

interface Params {
  params: { id: string }
}

function parseId(raw: string) {
  const id = Number.parseInt(raw, 10)
  if (Number.isNaN(id)) throw new Error("ID inválido")
  return id
}

