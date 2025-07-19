import pool from "./db"
import type {
  Cliente,
  Pedido,
  PedidoHistorico,
  CreatePedidoRequest,
  PedidoFilters,
  PedidoStats,
} from "../types/pedidos"

// Funções para Clientes
export async function getAllClientes(): Promise<Cliente[]> {
  const result = await pool.query(`
    SELECT * FROM clientes 
    WHERE situacao = 'Ativo'
    ORDER BY nome
  `)
  return result.rows
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  const result = await pool.query(
    `
    SELECT * FROM clientes WHERE id = $1
  `,
    [id],
  )

  return result.rows[0] || null
}

export async function getClienteByBlingId(blingId: number): Promise<Cliente | null> {
  const result = await pool.query(
    `
    SELECT * FROM clientes WHERE bling_id = $1
  `,
    [blingId],
  )

  return result.rows[0] || null
}

export async function createCliente(cliente: Omit<Cliente, "id" | "created_at" | "updated_at">): Promise<Cliente> {
  const result = await pool.query(
    `
    INSERT INTO clientes (
      bling_id, nome, email, telefone, celular, documento, tipo_pessoa,
      inscricao_estadual, inscricao_municipal, nome_fantasia,
      endereco_logradouro, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cep, endereco_cidade, endereco_uf,
      endereco_pais, observacoes, situacao
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    RETURNING *
  `,
    [
      cliente.bling_id,
      cliente.nome,
      cliente.email,
      cliente.telefone,
      cliente.celular,
      cliente.documento,
      cliente.tipo_pessoa,
      cliente.inscricao_estadual,
      cliente.inscricao_municipal,
      cliente.nome_fantasia,
      cliente.endereco_logradouro,
      cliente.endereco_numero,
      cliente.endereco_complemento,
      cliente.endereco_bairro,
      cliente.endereco_cep,
      cliente.endereco_cidade,
      cliente.endereco_uf,
      cliente.endereco_pais,
      cliente.observacoes,
      cliente.situacao,
    ],
  )

  return result.rows[0]
}

export async function updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente | null> {
  const fields = []
  const values = []
  let paramCount = 1

  Object.entries(cliente).forEach(([key, value]) => {
    if (key !== "id" && key !== "created_at" && key !== "updated_at" && value !== undefined) {
      fields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  })

  if (fields.length === 0) {
    throw new Error("Nenhum campo para atualizar")
  }

  values.push(id)

  const result = await pool.query(
    `
    UPDATE clientes 
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `,
    values,
  )

  return result.rows[0] || null
}

// Funções para Pedidos
export async function getAllPedidos(filters: PedidoFilters = {}): Promise<{ pedidos: Pedido[]; total: number }> {
  let whereClause = "WHERE 1=1"
  const values = []
  let paramCount = 1

  if (filters.cliente_id) {
    whereClause += ` AND p.cliente_id = $${paramCount}`
    values.push(filters.cliente_id)
    paramCount++
  }

  if (filters.situacao) {
    whereClause += ` AND p.situacao = $${paramCount}`
    values.push(filters.situacao)
    paramCount++
  }

  if (filters.data_inicio) {
    whereClause += ` AND p.data_pedido >= $${paramCount}`
    values.push(filters.data_inicio)
    paramCount++
  }

  if (filters.data_fim) {
    whereClause += ` AND p.data_pedido <= $${paramCount}`
    values.push(filters.data_fim)
    paramCount++
  }

  if (filters.vendedor) {
    whereClause += ` AND p.vendedor ILIKE $${paramCount}`
    values.push(`%${filters.vendedor}%`)
    paramCount++
  }

  if (filters.forma_pagamento) {
    whereClause += ` AND p.forma_pagamento = $${paramCount}`
    values.push(filters.forma_pagamento)
    paramCount++
  }

  // Contar total
  const countResult = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM pedidos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ${whereClause}
  `,
    values,
  )

  const total = Number.parseInt(countResult.rows[0].total)

  // Buscar pedidos com paginação
  const limit = filters.limit || 50
  const offset = ((filters.page || 1) - 1) * limit

  const result = await pool.query(
    `
    SELECT 
      p.*,
      c.nome as cliente_nome,
      c.email as cliente_email,
      c.documento as cliente_documento
    FROM pedidos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ${whereClause}
    ORDER BY p.data_pedido DESC, p.id DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    [...values, limit, offset],
  )

  const pedidos = result.rows.map((row) => ({
    ...row,
    cliente: {
      id: row.cliente_id,
      nome: row.cliente_nome,
      email: row.cliente_email,
      documento: row.cliente_documento,
    },
  }))

  return { pedidos, total }
}

export async function getPedidoById(id: number): Promise<Pedido | null> {
  const result = await pool.query(
    `
    SELECT 
      p.*,
      c.nome as cliente_nome,
      c.email as cliente_email,
      c.documento as cliente_documento,
      c.telefone as cliente_telefone,
      c.endereco_logradouro,
      c.endereco_numero,
      c.endereco_bairro,
      c.endereco_cidade,
      c.endereco_uf,
      c.endereco_cep
    FROM pedidos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE p.id = $1
  `,
    [id],
  )

  if (result.rows.length === 0) {
    return null
  }

  const pedido = result.rows[0]

  // Buscar itens
  const itensResult = await pool.query(
    `
    SELECT * FROM pedido_itens WHERE pedido_id = $1 ORDER BY id
  `,
    [id],
  )

  // Buscar parcelas
  const parcelasResult = await pool.query(
    `
    SELECT * FROM pedido_parcelas WHERE pedido_id = $1 ORDER BY numero_parcela
  `,
    [id],
  )

  return {
    ...pedido,
    cliente: {
      id: pedido.cliente_id,
      nome: pedido.cliente_nome,
      email: pedido.cliente_email,
      documento: pedido.cliente_documento,
      telefone: pedido.cliente_telefone,
      endereco_logradouro: pedido.endereco_logradouro,
      endereco_numero: pedido.endereco_numero,
      endereco_bairro: pedido.endereco_bairro,
      endereco_cidade: pedido.endereco_cidade,
      endereco_uf: pedido.endereco_uf,
      endereco_cep: pedido.endereco_cep,
    },
    itens: itensResult.rows,
    parcelas: parcelasResult.rows,
  }
}

export async function createPedido(pedidoData: CreatePedidoRequest): Promise<Pedido> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // 1. Criar ou buscar cliente
    let cliente_id: number

    if (pedidoData.cliente.id) {
      cliente_id = pedidoData.cliente.id
    } else {
      // Verificar se cliente já existe por documento ou email
      let clienteExistente = null

      if (pedidoData.cliente.documento) {
        const result = await client.query(
          `
          SELECT id FROM clientes WHERE documento = $1
        `,
          [pedidoData.cliente.documento],
        )
        clienteExistente = result.rows[0]
      }

      if (!clienteExistente && pedidoData.cliente.email) {
        const result = await client.query(
          `
          SELECT id FROM clientes WHERE email = $1
        `,
          [pedidoData.cliente.email],
        )
        clienteExistente = result.rows[0]
      }

      if (clienteExistente) {
        cliente_id = clienteExistente.id
      } else {
        // Criar novo cliente
        const clienteResult = await client.query(
          `
          INSERT INTO clientes (
            nome, email, telefone, celular, documento, tipo_pessoa,
            endereco_logradouro, endereco_numero, endereco_complemento,
            endereco_bairro, endereco_cep, endereco_cidade, endereco_uf
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `,
          [
            pedidoData.cliente.nome,
            pedidoData.cliente.email,
            pedidoData.cliente.telefone,
            pedidoData.cliente.celular,
            pedidoData.cliente.documento,
            pedidoData.cliente.tipo_pessoa || "F",
            pedidoData.cliente.endereco_logradouro,
            pedidoData.cliente.endereco_numero,
            pedidoData.cliente.endereco_complemento,
            pedidoData.cliente.endereco_bairro,
            pedidoData.cliente.endereco_cep,
            pedidoData.cliente.endereco_cidade,
            pedidoData.cliente.endereco_uf,
          ],
        )
        cliente_id = clienteResult.rows[0].id
      }
    }

    // 2. Calcular totais
    let total_produtos = 0
    let total_desconto = 0

    for (const item of pedidoData.itens) {
      const valor_item = item.quantidade * item.valor_unitario
      const desconto_item = item.valor_desconto || 0
      total_produtos += valor_item
      total_desconto += desconto_item
    }

    const total_geral = total_produtos - total_desconto

    // 3. Criar pedido
    const pedidoResult = await client.query(
      `
      INSERT INTO pedidos (
        cliente_id, data_pedido, data_prevista, total_produtos, total_desconto,
        total_geral, observacoes, observacoes_internas, vendedor, forma_pagamento,
        condicao_pagamento, transportadora, frete_por_conta, peso_bruto,
        quantidade_volumes, prazo_entrega, situacao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `,
      [
        cliente_id,
        pedidoData.data_pedido || new Date(),
        pedidoData.data_prevista,
        total_produtos,
        total_desconto,
        total_geral,
        pedidoData.observacoes,
        pedidoData.observacoes_internas,
        pedidoData.vendedor,
        pedidoData.forma_pagamento,
        pedidoData.condicao_pagamento,
        pedidoData.transportadora,
        pedidoData.frete_por_conta,
        pedidoData.peso_bruto,
        pedidoData.quantidade_volumes,
        pedidoData.prazo_entrega,
        "Em aberto",
      ],
    )

    const pedido = pedidoResult.rows[0]

    // 4. Criar itens
    for (const item of pedidoData.itens) {
      const valor_total = item.quantidade * item.valor_unitario - (item.valor_desconto || 0)

      await client.query(
        `
        INSERT INTO pedido_itens (
          pedido_id, produto_id, codigo_produto, nome_produto, quantidade,
          valor_unitario, valor_desconto, valor_total, aliquota_ipi, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          pedido.id,
          item.produto_id,
          item.codigo_produto,
          item.nome_produto,
          item.quantidade,
          item.valor_unitario,
          item.valor_desconto || 0,
          valor_total,
          item.aliquota_ipi || 0,
          item.observacoes,
        ],
      )
    }

    // 5. Criar parcelas se fornecidas
    if (pedidoData.parcelas && pedidoData.parcelas.length > 0) {
      for (const parcela of pedidoData.parcelas) {
        await client.query(
          `
          INSERT INTO pedido_parcelas (
            pedido_id, numero_parcela, data_vencimento, valor,
            forma_pagamento, observacoes
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            pedido.id,
            parcela.numero_parcela,
            parcela.data_vencimento,
            parcela.valor,
            parcela.forma_pagamento,
            parcela.observacoes,
          ],
        )
      }
    }

    // 6. Registrar histórico
    await client.query(
      `
      INSERT INTO pedido_historico (pedido_id, situacao_nova, observacoes, usuario)
      VALUES ($1, $2, $3, $4)
    `,
      [pedido.id, "Em aberto", "Pedido criado", "Sistema"],
    )

    await client.query("COMMIT")

    return (await getPedidoById(pedido.id)) as Pedido
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export async function updatePedidoSituacao(
  id: number,
  novaSituacao: string,
  observacoes?: string,
  usuario?: string,
): Promise<boolean> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Buscar situação atual
    const pedidoAtual = await client.query(
      `
      SELECT situacao FROM pedidos WHERE id = $1
    `,
      [id],
    )

    if (pedidoAtual.rows.length === 0) {
      throw new Error("Pedido não encontrado")
    }

    const situacaoAnterior = pedidoAtual.rows[0].situacao

    // Atualizar situação
    await client.query(
      `
      UPDATE pedidos SET situacao = $1, updated_at = NOW() WHERE id = $2
    `,
      [novaSituacao, id],
    )

    // Registrar histórico
    await client.query(
      `
      INSERT INTO pedido_historico (pedido_id, situacao_anterior, situacao_nova, observacoes, usuario)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [id, situacaoAnterior, novaSituacao, observacoes, usuario || "Sistema"],
    )

    await client.query("COMMIT")
    return true
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export async function getPedidoStats(): Promise<PedidoStats> {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total_pedidos,
      COALESCE(SUM(total_geral), 0) as total_vendas,
      COALESCE(AVG(total_geral), 0) as ticket_medio,
      COUNT(CASE WHEN situacao = 'Em aberto' THEN 1 END) as pedidos_em_aberto,
      COUNT(CASE WHEN situacao = 'Faturado' THEN 1 END) as pedidos_faturados,
      COUNT(CASE WHEN situacao = 'Cancelado' THEN 1 END) as pedidos_cancelados,
      COALESCE(SUM(CASE WHEN data_pedido >= date_trunc('month', CURRENT_DATE) THEN total_geral ELSE 0 END), 0) as vendas_mes_atual,
      COALESCE(SUM(CASE WHEN data_pedido >= date_trunc('month', CURRENT_DATE - interval '1 month') 
                        AND data_pedido < date_trunc('month', CURRENT_DATE) THEN total_geral ELSE 0 END), 0) as vendas_mes_anterior
    FROM pedidos
    WHERE data_pedido >= CURRENT_DATE - interval '12 months'
  `)

  const stats = result.rows[0]

  const crescimento_percentual =
    stats.vendas_mes_anterior > 0
      ? ((stats.vendas_mes_atual - stats.vendas_mes_anterior) / stats.vendas_mes_anterior) * 100
      : 0

  return {
    total_pedidos: Number.parseInt(stats.total_pedidos),
    total_vendas: Number.parseFloat(stats.total_vendas),
    ticket_medio: Number.parseFloat(stats.ticket_medio),
    pedidos_em_aberto: Number.parseInt(stats.pedidos_em_aberto),
    pedidos_faturados: Number.parseInt(stats.pedidos_faturados),
    pedidos_cancelados: Number.parseInt(stats.pedidos_cancelados),
    vendas_mes_atual: Number.parseFloat(stats.vendas_mes_atual),
    vendas_mes_anterior: Number.parseFloat(stats.vendas_mes_anterior),
    crescimento_percentual: Number.parseFloat(crescimento_percentual.toFixed(2)),
  }
}

export async function getPedidoHistorico(pedidoId: number): Promise<PedidoHistorico[]> {
  const result = await pool.query(
    `
    SELECT * FROM pedido_historico 
    WHERE pedido_id = $1 
    ORDER BY data_alteracao DESC
  `,
    [pedidoId],
  )

  return result.rows
}
