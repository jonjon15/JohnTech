import { listProducts, createProduct, removeProduct } from "@/lib/db"
import { z } from "zod"

// GET: Lista todos os produtos de homologação
export async function GET(req: NextRequest) {
  try {
    const produtos = await listProducts()
    return NextResponse.json({ data: produtos, message: "Produtos listados com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar produtos" }, { status: 500 })
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
    return NextResponse.json({ data: produto, message: "Produto criado com sucesso" }, { status: 201 });
  } catch (err: any) {
    const message = err instanceof z.ZodError ? err.errors : err.message;
    return NextResponse.json({ error: "Erro ao criar produto", details: message }, { status: 400 });
  }
}

// DELETE: Remove um produto de homologação (por id via query param)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
  try {
    const ok = await removeProduct(Number(id))
    if (!ok) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    return NextResponse.json({ success: true, message: "Produto removido com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover produto" }, { status: 500 })
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

