export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { listProducts, createProduct, type BlingProduct } from "@/lib/db"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

export async function GET(req: NextRequest) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const data = await listProducts()
    const elapsed = Date.now() - t0
    logBlingApiCall("GET", "/api/bling/homologacao/produtos", requestId, elapsed, true)

    return NextResponse.json(createBlingApiResponse({ data }, elapsed, requestId))
  } catch (err) {
    const elapsed = Date.now() - t0
    logBlingApiCall("GET", "/api/bling/homologacao/produtos", requestId, elapsed, false)
    return NextResponse.json(handleBlingApiError(err, "LIST_PRODUCTS"), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const body = await req.json()
    // Basic validation
    if (!body?.nome || !body?.codigo) {
      return NextResponse.json(handleBlingApiError("Campos obrigatórios ausentes", "BAD_REQUEST"), { status: 400 })
    }

    const novoProduto = await createProduct({
      nome: body.nome,
      codigo: body.codigo,
      preco: Number(body.preco ?? 0),
      descricao_curta: body.descricao_curta ?? null,
      situacao: body.situacao ?? "Ativo",
      tipo: body.tipo ?? "P",
      formato: body.formato ?? "S",
      bling_id: body.bling_id ?? null,
      created_at: "", // ignored by insert
      updated_at: "",
      id: 0,
    } as unknown as Omit<BlingProduct, "id" | "created_at" | "updated_at">)

    const elapsed = Date.now() - t0
    logBlingApiCall("POST", "/api/bling/homologacao/produtos", requestId, elapsed, true)

    return NextResponse.json(createBlingApiResponse({ data: novoProduto }, elapsed, requestId), { status: 201 })
  } catch (err: any) {
    const elapsed = Date.now() - t0
    logBlingApiCall("POST", "/api/bling/homologacao/produtos", requestId, elapsed, false)

    // Unique constraint
    if (err.code === "23505") {
      return NextResponse.json(handleBlingApiError("Código já existe", "DUPLICATE_CODE"), { status: 409 })
    }

    return NextResponse.json(handleBlingApiError(err, "CREATE_PRODUCT"), { status: 500 })
  }
}
