import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db"
import { logBlingApiCall } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)
  logBlingApiCall(requestId, "GET", `/api/bling/homologacao/produtos/${params.id}`, {})

  try {
    const id = Number.parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: { message: "ID inválido" } }, { status: 400 })
    }
    const produto = await getProductById(id)
    if (!produto) {
      return NextResponse.json({ success: false, error: { message: "Produto não encontrado" } }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: produto })
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ success: false, error: { message: "Erro interno do servidor" } }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)
  logBlingApiCall(requestId, "PUT", `/api/bling/homologacao/produtos/${params.id}`, {})

  try {
    const id = Number.parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: { message: "ID inválido" } }, { status: 400 })
    }
    const body = await request.json()
    if (body.preco !== undefined) {
      body.preco = typeof body.preco === "string" ? Number.parseFloat(body.preco) : body.preco
    }
    const produto = await updateProduct(id, body)
    if (!produto) {
      return NextResponse.json({ success: false, error: { message: "Produto não encontrado" } }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: produto })
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ success: false, error: { message: "Erro ao atualizar produto" } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = Math.random().toString(36).substring(7)
  logBlingApiCall(requestId, "DELETE", `/api/bling/homologacao/produtos/${params.id}`, {})

  try {
    const id = Number.parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: { message: "ID inválido" } }, { status: 400 })
    }
    const deleted = await deleteProduct(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: { message: "Produto não encontrado" } }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Produto deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar produto:", error)
    return NextResponse.json({ success: false, error: { message: "Erro ao deletar produto" } }, { status: 500 })
  }
}
