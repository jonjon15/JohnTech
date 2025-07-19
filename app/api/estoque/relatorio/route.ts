import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { handleBlingError, logRequest } from "@/lib/bling-error-handler"

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logRequest(requestId, "GET", "/api/estoque/relatorio", {})

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") || "geral"
    const dataInicio = searchParams.get("data_inicio")
    const dataFim = searchParams.get("data_fim")
    const depositoId = searchParams.get("deposito_id")

    let relatorio: any = {}

    switch (tipo) {
      case "geral":
        relatorio = await gerarRelatorioGeral(depositoId)
        break
      case "movimentacoes":
        relatorio = await gerarRelatorioMovimentacoes(dataInicio, dataFim, depositoId)
        break
      case "baixo_estoque":
        relatorio = await gerarRelatorioBaixoEstoque(depositoId)
        break
      case "sem_movimento":
        relatorio = await gerarRelatorioSemMovimento(dataInicio, dataFim, depositoId)
        break
      default:
        throw new Error("Tipo de relatório inválido")
    }

    return NextResponse.json({
      success: true,
      data: relatorio,
      requestId,
    })
  } catch (error) {
    console.error(`[${requestId}] Erro ao gerar relatório:`, error)
    return handleBlingError(error, requestId)
  }
}

async function gerarRelatorioGeral(depositoId?: string | null) {
  let whereClause = "WHERE 1=1"
  const params: any[] = []
  let paramCount = 1

  if (depositoId) {
    whereClause += ` AND e.deposito_id = $${paramCount}`
    params.push(Number.parseInt(depositoId))
    paramCount++
  }

  const query = `
    SELECT 
      p.codigo,
      p.nome,
      p.categoria,
      e.deposito_nome,
      e.quantidade_fisica,
      e.quantidade_disponivel,
      e.quantidade_reservada,
      e.quantidade_minima,
      e.custo_medio,
      (e.quantidade_disponivel * e.custo_medio) as valor_estoque,
      CASE 
        WHEN e.quantidade_minima > 0 AND e.quantidade_disponivel <= e.quantidade_minima THEN 'BAIXO'
        WHEN e.quantidade_disponivel = 0 THEN 'ZERADO'
        ELSE 'NORMAL'
      END as status_estoque
    FROM estoque e
    JOIN produtos p ON e.produto_id = p.id
    ${whereClause}
    ORDER BY p.nome
  `

  const result = await pool.query(query, params)

  const resumo = {
    total_produtos: result.rows.length,
    produtos_baixo_estoque: result.rows.filter((r) => r.status_estoque === "BAIXO").length,
    produtos_zerados: result.rows.filter((r) => r.status_estoque === "ZERADO").length,
    valor_total_estoque: result.rows.reduce((sum, r) => sum + Number.parseFloat(r.valor_estoque || "0"), 0),
  }

  return {
    resumo,
    produtos: result.rows.map((row) => ({
      ...row,
      quantidade_fisica: Number.parseFloat(row.quantidade_fisica || "0"),
      quantidade_disponivel: Number.parseFloat(row.quantidade_disponivel || "0"),
      quantidade_reservada: Number.parseFloat(row.quantidade_reservada || "0"),
      quantidade_minima: Number.parseFloat(row.quantidade_minima || "0"),
      custo_medio: Number.parseFloat(row.custo_medio || "0"),
      valor_estoque: Number.parseFloat(row.valor_estoque || "0"),
    })),
  }
}

async function gerarRelatorioMovimentacoes(
  dataInicio?: string | null,
  dataFim?: string | null,
  depositoId?: string | null,
) {
  let whereClause = "WHERE 1=1"
  const params: any[] = []
  let paramCount = 1

  if (dataInicio) {
    whereClause += ` AND DATE(em.data_movimentacao) >= $${paramCount}`
    params.push(dataInicio)
    paramCount++
  }

  if (dataFim) {
    whereClause += ` AND DATE(em.data_movimentacao) <= $${paramCount}`
    params.push(dataFim)
    paramCount++
  }

  if (depositoId) {
    whereClause += ` AND em.deposito_id = $${paramCount}`
    params.push(Number.parseInt(depositoId))
    paramCount++
  }

  const query = `
    SELECT 
      em.data_movimentacao,
      p.codigo,
      p.nome as produto_nome,
      em.tipo,
      em.operacao,
      em.quantidade,
      em.valor_unitario,
      em.valor_total,
      em.documento,
      em.observacoes,
      em.usuario
    FROM estoque_movimentacoes em
    JOIN produtos p ON em.produto_id = p.id
    ${whereClause}
    ORDER BY em.data_movimentacao DESC
  `

  const result = await pool.query(query, params)

  const resumo = {
    total_movimentacoes: result.rows.length,
    entradas: result.rows.filter((r) => r.operacao === "E").length,
    saidas: result.rows.filter((r) => r.operacao === "S").length,
    valor_total_entradas: result.rows
      .filter((r) => r.operacao === "E")
      .reduce((sum, r) => sum + Number.parseFloat(r.valor_total || "0"), 0),
    valor_total_saidas: result.rows
      .filter((r) => r.operacao === "S")
      .reduce((sum, r) => sum + Number.parseFloat(r.valor_total || "0"), 0),
  }

  return {
    resumo,
    movimentacoes: result.rows.map((row) => ({
      ...row,
      quantidade: Number.parseFloat(row.quantidade || "0"),
      valor_unitario: Number.parseFloat(row.valor_unitario || "0"),
      valor_total: Number.parseFloat(row.valor_total || "0"),
    })),
  }
}

async function gerarRelatorioBaixoEstoque(depositoId?: string | null) {
  let whereClause = "WHERE e.quantidade_minima > 0 AND e.quantidade_disponivel <= e.quantidade_minima"
  const params: any[] = []
  let paramCount = 1

  if (depositoId) {
    whereClause += ` AND e.deposito_id = $${paramCount}`
    params.push(Number.parseInt(depositoId))
    paramCount++
  }

  const query = `
    SELECT 
      p.codigo,
      p.nome,
      p.categoria,
      e.deposito_nome,
      e.quantidade_disponivel,
      e.quantidade_minima,
      (e.quantidade_minima - e.quantidade_disponivel) as quantidade_sugerida,
      e.custo_medio,
      ((e.quantidade_minima - e.quantidade_disponivel) * e.custo_medio) as valor_sugerido
    FROM estoque e
    JOIN produtos p ON e.produto_id = p.id
    ${whereClause}
    ORDER BY (e.quantidade_minima - e.quantidade_disponivel) DESC
  `

  const result = await pool.query(query, params)

  const resumo = {
    total_produtos: result.rows.length,
    valor_total_sugerido: result.rows.reduce((sum, r) => sum + Number.parseFloat(r.valor_sugerido || "0"), 0),
  }

  return {
    resumo,
    produtos: result.rows.map((row) => ({
      ...row,
      quantidade_disponivel: Number.parseFloat(row.quantidade_disponivel || "0"),
      quantidade_minima: Number.parseFloat(row.quantidade_minima || "0"),
      quantidade_sugerida: Number.parseFloat(row.quantidade_sugerida || "0"),
      custo_medio: Number.parseFloat(row.custo_medio || "0"),
      valor_sugerido: Number.parseFloat(row.valor_sugerido || "0"),
    })),
  }
}

async function gerarRelatorioSemMovimento(
  dataInicio?: string | null,
  dataFim?: string | null,
  depositoId?: string | null,
) {
  const dataInicioFiltro = dataInicio || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const dataFimFiltro = dataFim || new Date().toISOString().split("T")[0]

  let whereClause = "WHERE 1=1"
  const params: any[] = [dataInicioFiltro, dataFimFiltro]
  let paramCount = 3

  if (depositoId) {
    whereClause += ` AND e.deposito_id = $${paramCount}`
    params.push(Number.parseInt(depositoId))
    paramCount++
  }

  const query = `
    SELECT 
      p.codigo,
      p.nome,
      p.categoria,
      e.deposito_nome,
      e.quantidade_disponivel,
      e.custo_medio,
      (e.quantidade_disponivel * e.custo_medio) as valor_estoque,
      COALESCE(ultima_mov.data_ultima_movimentacao, e.created_at) as data_ultima_movimentacao
    FROM estoque e
    JOIN produtos p ON e.produto_id = p.id
    LEFT JOIN (
      SELECT 
        produto_id,
        deposito_id,
        MAX(data_movimentacao) as data_ultima_movimentacao
      FROM estoque_movimentacoes
      GROUP BY produto_id, deposito_id
    ) ultima_mov ON e.produto_id = ultima_mov.produto_id AND e.deposito_id = ultima_mov.deposito_id
    ${whereClause}
    AND (
      ultima_mov.data_ultima_movimentacao IS NULL 
      OR ultima_mov.data_ultima_movimentacao < $1
    )
    AND e.quantidade_disponivel > 0
    ORDER BY COALESCE(ultima_mov.data_ultima_movimentacao, e.created_at) ASC
  `

  const result = await pool.query(query, params)

  const resumo = {
    total_produtos: result.rows.length,
    valor_total_parado: result.rows.reduce((sum, r) => sum + Number.parseFloat(r.valor_estoque || "0"), 0),
    periodo_analise: `${dataInicioFiltro} a ${dataFimFiltro}`,
  }

  return {
    resumo,
    produtos: result.rows.map((row) => ({
      ...row,
      quantidade_disponivel: Number.parseFloat(row.quantidade_disponivel || "0"),
      custo_medio: Number.parseFloat(row.custo_medio || "0"),
      valor_estoque: Number.parseFloat(row.valor_estoque || "0"),
    })),
  }
}
