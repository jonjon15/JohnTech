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

/* ---------- PATCH /[id]/situacoes ---------- */
export async function PATCH(req: NextRequest, { params }: Params) {
  const t0 = Date.now()
  const requestId = crypto.randomUUID()

  try {
    const id = parseId(params.id)
    const { situacao } = await req.json()
    if (!situacao || !["aprovado", "rejeitado"].includes(situacao)) {
      return NextResponse.json(handleBlingApiError("Situação inválida. Use 'aprovado' ou 'rejeitado'", "INVALID_STATUS"), { status: 400 })
    }

    const produto = await getProduct(id)
    if (!produto) {
      return NextResponse.json(handleBlingApiError("Produto não encontrado", "NOT_FOUND"), { status: 404 })
    }

    const updated = await updateProduct(id, { situacao })
    if (!updated) {
      return NextResponse.json(handleBlingApiError("Falha ao atualizar situação", "UPDATE_STATUS_FAIL"), { status: 500 })
    }

    const elapsed = Date.now() - t0
    logBlingApiCall("PATCH", `/api/bling/homologacao/produtos/${id}/situacoes`, requestId, elapsed, true)

    return NextResponse.json(
      createBlingApiResponse({ data: { id, situacao }, message: "Situação atualizada" }, elapsed, requestId),
    )
  } catch (err: any) {
    const elapsed = Date.now() - t0
    logBlingApiCall("PATCH", `/api/bling/homologacao/produtos/${params.id}/situacoes`, requestId, elapsed, false)
    return NextResponse.json(handleBlingApiError(err, "PATCH_STATUS"), {
      status: err.message === "ID inválido" ? 400 : 500,
    })
  }
}
