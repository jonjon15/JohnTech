export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getProduct, updateProduct, removeProduct, type BlingProduct } from "@/lib/db"
import { handleBlingApiError, createBlingApiResponse, logBlingApiCall } from "@/lib/bling-error-handler"

interface Params {
  params: { id: string }
}

function parseId(raw: string) {
  const id = Number.parseInt(raw, 10)
  if (Number.isNaN(id)) throw new Error("ID inválido")
  return id
}

/* ---------- GET /[id] ---------- */
export async function GET(_req: NextRequest, { params }: Params) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const id = parseId(params.id)
    const produto = await getProduct(id)
    if (!produto) {
      return NextResponse.json(handleBlingApiError("Produto não encontrado", "NOT_FOUND"), { status: 404 })
    }

    const elapsed = Date.now() - t0
    logBlingApiCall("GET", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, true)

    return NextResponse.json(createBlingApiResponse({ data: produto }, elapsed, requestId))
  } catch (err) {
    const elapsed = Date.now() - t0
    logBlingApiCall("GET", `/api/bling/homologacao/produtos/${params.id}`, requestId, elapsed, false)
    return NextResponse.json(handleBlingApiError(err, "GET_PRODUCT"), {
      status: (err instanceof Error && err.message === "ID inválido") ? 400 : 500,
    })
  }
}

/* ---------- PUT /[id] ---------- */
export async function PUT(req: NextRequest, { params }: Params) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const id = parseId(params.id)
    const payload: Partial<BlingProduct> = await req.json()
    const updated = await updateProduct(id, payload)
    if (!updated) {
      return NextResponse.json(handleBlingApiError("Produto não encontrado", "NOT_FOUND"), { status: 404 })
    }

    const elapsed = Date.now() - t0
    logBlingApiCall("PUT", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, true)

    return NextResponse.json(
      createBlingApiResponse({ data: updated, message: "Produto atualizado" }, elapsed, requestId),
    )
  } catch (err: any) {
    const elapsed = Date.now() - t0
    logBlingApiCall("PUT", `/api/bling/homologacao/produtos/${params.id}`, requestId, elapsed, false)

    if (err.code === "23505") {
      return NextResponse.json(handleBlingApiError("Código já existe", "DUPLICATE_CODE"), { status: 409 })
    }
    return NextResponse.json(handleBlingApiError(err, "UPDATE_PRODUCT"), {
      status: err.message === "ID inválido" ? 400 : 500,
    })
  }
}

/* ---------- DELETE /[id] ---------- */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const id = parseId(params.id)
    const success = await removeProduct(id)
    if (!success) {
      return NextResponse.json(handleBlingApiError("Produto não encontrado", "NOT_FOUND"), { status: 404 })
    }

    const elapsed = Date.now() - t0
    logBlingApiCall("DELETE", `/api/bling/homologacao/produtos/${id}`, requestId, elapsed, true)

    return NextResponse.json(createBlingApiResponse({ data: { id, deleted: true } }, elapsed, requestId))
  } catch (err) {
    const elapsed = Date.now() - t0
    logBlingApiCall("DELETE", `/api/bling/homologacao/produtos/${params.id}`, requestId, elapsed, false)
    return NextResponse.json(handleBlingApiError(err, "DELETE_PRODUCT"), {
      status: (err instanceof Error && err.message === "ID inválido") ? 400 : 500,
    })
  }
}
