import pool from "./db"
import type { AlertaSistema, DashboardData, RelatorioFiltros } from "@/types/analytics"

export async function getDashboardData(): Promise<DashboardData> {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0)

  // Vendas de hoje
  const vendasHojeResult = await pool.query(`
    SELECT COALESCE(SUM(total_geral), 0) as vendas_hoje
    FROM pedidos 
    WHERE DATE(data_pedido) = CURRENT_DATE
    AND situacao != 'Cancelado'
  `)

  // Vendas do mês
  const vendasMesResult = await pool.query(
    `
    SELECT COALESCE(SUM(total_geral), 0) as vendas_mes
    FROM pedidos 
    WHERE data_pedido >= $1
    AND situacao != 'Cancelado'
  `,
    [inicioMes],
  )

  // Vendas do mês anterior para calcular crescimento
  const vendasMesAnteriorResult = await pool.query(
    `
    SELECT COALESCE(SUM(total_geral), 0) as vendas_mes_anterior
    FROM pedidos 
    WHERE data_pedido >= $1 AND data_pedido <= $2
    AND situacao != 'Cancelado'
  `,
    [mesAnterior, fimMesAnterior],
  )

  // Pedidos pendentes
  const pedidosPendentesResult = await pool.query(`
    SELECT COUNT(*) as pedidos_pendentes
    FROM pedidos 
    WHERE situacao IN ('Em aberto', 'Confirmado')
  `)

  // Estoque baixo
  const estoqueBaixoResult = await pool.query(`
    SELECT COUNT(*) as estoque_baixo
    FROM estoque e
    WHERE e.quantidade_disponivel <= COALESCE(e.quantidade_minima, 0)
    AND e.quantidade_minima > 0
  `)

  // Top produtos
  const topProdutosResult = await pool.query(
    `
    SELECT 
      pi.nome_produto as nome,
      SUM(pi.quantidade) as quantidade,
      SUM(pi.valor_total) as valor
    FROM pedido_itens pi
    JOIN pedidos p ON pi.pedido_id = p.id
    WHERE p.data_pedido >= $1
    AND p.situacao != 'Cancelado'
    GROUP BY pi.nome_produto
    ORDER BY valor DESC
    LIMIT 5
  `,
    [inicioMes],
  )

  // Vendas por dia (últimos 30 dias)
  const vendasPorDiaResult = await pool.query(`
    SELECT 
      DATE(data_pedido) as data,
      COALESCE(SUM(total_geral), 0) as valor,
      COUNT(*) as pedidos
    FROM pedidos
    WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days'
    AND situacao != 'Cancelado'
    GROUP BY DATE(data_pedido)
    ORDER BY data
  `)

  // Alertas recentes
  const alertasResult = await pool.query(`
    SELECT * FROM alertas_sistema
    WHERE lido = false
    ORDER BY data_criacao DESC
    LIMIT 10
  `)

  const vendasMes = Number.parseFloat(vendasMesResult.rows[0].vendas_mes)
  const vendasMesAnterior = Number.parseFloat(vendasMesAnteriorResult.rows[0].vendas_mes_anterior)
  const crescimentoVendas = vendasMesAnterior > 0 ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior) * 100 : 0

  return {
    vendas_hoje: Number.parseFloat(vendasHojeResult.rows[0].vendas_hoje),
    vendas_mes: vendasMes,
    pedidos_pendentes: Number.parseInt(pedidosPendentesResult.rows[0].pedidos_pendentes),
    estoque_baixo: Number.parseInt(estoqueBaixoResult.rows[0].estoque_baixo),
    crescimento_vendas: Number.parseFloat(crescimentoVendas.toFixed(2)),
    top_produtos: topProdutosResult.rows.map((row) => ({
      nome: row.nome,
      quantidade: Number.parseFloat(row.quantidade),
      valor: Number.parseFloat(row.valor),
    })),
    vendas_por_dia: vendasPorDiaResult.rows.map((row) => ({
      data: row.data.toISOString().split("T")[0],
      valor: Number.parseFloat(row.valor),
      pedidos: Number.parseInt(row.pedidos),
    })),
    alertas_recentes: alertasResult.rows,
  }
}

export async function gerarRelatorioVendas(filtros: RelatorioFiltros): Promise<any> {
  let whereClause = "WHERE p.situacao != 'Cancelado'"
  const params: any[] = []
  let paramCount = 1

  if (filtros.data_inicio) {
    whereClause += ` AND p.data_pedido >= $${paramCount}`
    params.push(filtros.data_inicio)
    paramCount++
  }

  if (filtros.data_fim) {
    whereClause += ` AND p.data_pedido <= $${paramCount}`
    params.push(filtros.data_fim)
    paramCount++
  }

  if (filtros.vendedor) {
    whereClause += ` AND p.vendedor ILIKE $${paramCount}`
    params.push(`%${filtros.vendedor}%`)
    paramCount++
  }

  if (filtros.cliente_id) {
    whereClause += ` AND p.cliente_id = $${paramCount}`
    params.push(filtros.cliente_id)
    paramCount++
  }

  const query = `
    SELECT 
      COUNT(*) as total_pedidos,
      COALESCE(SUM(p.total_geral), 0) as total_vendas,
      COALESCE(AVG(p.total_geral), 0) as ticket_medio,
      COUNT(DISTINCT p.cliente_id) as clientes_ativos,
      COALESCE(SUM(pi.quantidade), 0) as produtos_vendidos,
      
      -- Vendas por mês
      DATE_TRUNC('month', p.data_pedido) as mes,
      EXTRACT(YEAR FROM p.data_pedido) as ano,
      EXTRACT(MONTH FROM p.data_pedido) as mes_numero,
      
      -- Top vendedores
      p.vendedor,
      COUNT(*) OVER (PARTITION BY p.vendedor) as pedidos_vendedor,
      SUM(p.total_geral) OVER (PARTITION BY p.vendedor) as vendas_vendedor,
      
      -- Top produtos
      pi.nome_produto,
      SUM(pi.quantidade) OVER (PARTITION BY pi.nome_produto) as quantidade_produto,
      SUM(pi.valor_total) OVER (PARTITION BY pi.nome_produto) as valor_produto,
      
      -- Top clientes
      c.nome as cliente_nome,
      COUNT(*) OVER (PARTITION BY p.cliente_id) as pedidos_cliente,
      SUM(p.total_geral) OVER (PARTITION BY p.cliente_id) as vendas_cliente
      
    FROM pedidos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
    ${whereClause}
    ORDER BY p.data_pedido DESC
  `

  const result = await pool.query(query, params)

  if (result.rows.length === 0) {
    return {
      resumo: {
        total_pedidos: 0,
        total_vendas: 0,
        ticket_medio: 0,
        clientes_ativos: 0,
        produtos_vendidos: 0,
      },
      vendas_por_mes: [],
      top_vendedores: [],
      top_produtos: [],
      top_clientes: [],
    }
  }

  const primeiraLinha = result.rows[0]

  // Agrupar dados
  const vendasPorMes = new Map()
  const topVendedores = new Map()
  const topProdutos = new Map()
  const topClientes = new Map()

  result.rows.forEach((row) => {
    // Vendas por mês
    const mesKey = `${row.ano}-${String(row.mes_numero).padStart(2, "0")}`
    if (!vendasPorMes.has(mesKey)) {
      vendasPorMes.set(mesKey, {
        mes: mesKey,
        vendas: 0,
        pedidos: 0,
      })
    }
    const mesData = vendasPorMes.get(mesKey)
    mesData.vendas += Number.parseFloat(row.total_geral || 0)
    mesData.pedidos += 1

    // Top vendedores
    if (row.vendedor) {
      topVendedores.set(row.vendedor, {
        nome: row.vendedor,
        pedidos: Number.parseInt(row.pedidos_vendedor),
        vendas: Number.parseFloat(row.vendas_vendedor),
      })
    }

    // Top produtos
    if (row.nome_produto) {
      topProdutos.set(row.nome_produto, {
        nome: row.nome_produto,
        quantidade: Number.parseFloat(row.quantidade_produto),
        valor: Number.parseFloat(row.valor_produto),
      })
    }

    // Top clientes
    if (row.cliente_nome) {
      topClientes.set(row.cliente_nome, {
        nome: row.cliente_nome,
        pedidos: Number.parseInt(row.pedidos_cliente),
        vendas: Number.parseFloat(row.vendas_cliente),
      })
    }
  })

  return {
    resumo: {
      total_pedidos: Number.parseInt(primeiraLinha.total_pedidos),
      total_vendas: Number.parseFloat(primeiraLinha.total_vendas),
      ticket_medio: Number.parseFloat(primeiraLinha.ticket_medio),
      clientes_ativos: Number.parseInt(primeiraLinha.clientes_ativos),
      produtos_vendidos: Number.parseFloat(primeiraLinha.produtos_vendidos),
    },
    vendas_por_mes: Array.from(vendasPorMes.values()).sort((a, b) => a.mes.localeCompare(b.mes)),
    top_vendedores: Array.from(topVendedores.values())
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 10),
    top_produtos: Array.from(topProdutos.values())
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10),
    top_clientes: Array.from(topClientes.values())
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 10),
  }
}

export async function criarAlertaSistema(alerta: Omit<AlertaSistema, "id" | "data_criacao">): Promise<AlertaSistema> {
  const result = await pool.query(
    `
    INSERT INTO alertas_sistema (tipo, titulo, descricao, severidade, lido, resolvido, usuario_responsavel, metadados)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
    [
      alerta.tipo,
      alerta.titulo,
      alerta.descricao,
      alerta.severidade,
      alerta.lido,
      alerta.resolvido,
      alerta.usuario_responsavel,
      alerta.metadados ? JSON.stringify(alerta.metadados) : null,
    ],
  )

  return result.rows[0]
}

export async function marcarAlertaComoLido(id: number): Promise<boolean> {
  const result = await pool.query(
    `
    UPDATE alertas_sistema 
    SET lido = true 
    WHERE id = $1
    RETURNING id
  `,
    [id],
  )

  return result.rows.length > 0
}

export async function resolverAlerta(id: number, usuario?: string): Promise<boolean> {
  const result = await pool.query(
    `
    UPDATE alertas_sistema 
    SET resolvido = true, data_resolucao = NOW(), usuario_responsavel = $2
    WHERE id = $1
    RETURNING id
  `,
    [id, usuario],
  )

  return result.rows.length > 0
}

export async function atualizarMetricasDiarias(data: Date): Promise<void> {
  const dataStr = data.toISOString().split("T")[0]

  const result = await pool.query(
    `
    SELECT 
      COALESCE(SUM(CASE WHEN situacao != 'Cancelado' THEN total_geral ELSE 0 END), 0) as vendas_total,
      COUNT(*) as pedidos_total,
      COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as pedidos_novos,
      COUNT(CASE WHEN situacao = 'Faturado' THEN 1 END) as pedidos_faturados,
      COUNT(CASE WHEN situacao = 'Cancelado' THEN 1 END) as pedidos_cancelados,
      COALESCE(AVG(CASE WHEN situacao != 'Cancelado' THEN total_geral END), 0) as ticket_medio
    FROM pedidos
    WHERE DATE(data_pedido) = $1
  `,
    [dataStr],
  )

  const clientesNovosResult = await pool.query(
    `
    SELECT COUNT(*) as clientes_novos
    FROM clientes
    WHERE DATE(created_at) = $1
  `,
    [dataStr],
  )

  const produtosVendidosResult = await pool.query(
    `
    SELECT COALESCE(SUM(pi.quantidade), 0) as produtos_vendidos
    FROM pedido_itens pi
    JOIN pedidos p ON pi.pedido_id = p.id
    WHERE DATE(p.data_pedido) = $1
    AND p.situacao != 'Cancelado'
  `,
    [dataStr],
  )

  const metricas = result.rows[0]
  const clientesNovos = clientesNovosResult.rows[0].clientes_novos
  const produtosVendidos = produtosVendidosResult.rows[0].produtos_vendidos

  await pool.query(
    `
    INSERT INTO metricas_diarias (
      data_referencia, vendas_total, pedidos_total, pedidos_novos,
      pedidos_faturados, pedidos_cancelados, clientes_novos,
      produtos_vendidos, ticket_medio
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (data_referencia)
    DO UPDATE SET
      vendas_total = EXCLUDED.vendas_total,
      pedidos_total = EXCLUDED.pedidos_total,
      pedidos_novos = EXCLUDED.pedidos_novos,
      pedidos_faturados = EXCLUDED.pedidos_faturados,
      pedidos_cancelados = EXCLUDED.pedidos_cancelados,
      clientes_novos = EXCLUDED.clientes_novos,
      produtos_vendidos = EXCLUDED.produtos_vendidos,
      ticket_medio = EXCLUDED.ticket_medio
  `,
    [
      data,
      metricas.vendas_total,
      metricas.pedidos_total,
      metricas.pedidos_novos,
      metricas.pedidos_faturados,
      metricas.pedidos_cancelados,
      clientesNovos,
      produtosVendidos,
      metricas.ticket_medio,
    ],
  )
}
