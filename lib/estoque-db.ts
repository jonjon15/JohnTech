import pool from "./db"
import type { EstoqueItem, MovimentacaoEstoque, Deposito, AlertaEstoque, RelatorioEstoque } from "@/types/estoque"

// Funções para Estoque
export async function getEstoqueByProduto(produtoId: number, depositoId?: number): Promise<EstoqueItem[]> {
  try {
    let query = `
      SELECT e.*, p.nome as produto_nome, p.codigo as produto_codigo, d.nome as deposito_nome
      FROM estoque e
      JOIN bling_products p ON e.produto_id = p.id
      JOIN depositos d ON e.deposito_id = d.id
      WHERE e.produto_id = $1
    `
    const params = [produtoId]

    if (depositoId) {
      query += " AND e.deposito_id = $2"
      params.push(depositoId)
    }

    query += " ORDER BY d.nome"

    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar estoque por produto:", error)
    throw error
  }
}

export async function getEstoqueByDeposito(depositoId: number): Promise<EstoqueItem[]> {
  try {
    const result = await pool.query(
      `
      SELECT e.*, p.nome as produto_nome, p.codigo as produto_codigo, d.nome as deposito_nome
      FROM estoque e
      JOIN bling_products p ON e.produto_id = p.id
      JOIN depositos d ON e.deposito_id = d.id
      WHERE e.deposito_id = $1
      ORDER BY p.nome
    `,
      [depositoId],
    )
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar estoque por depósito:", error)
    throw error
  }
}

export async function getAllEstoque(filters?: {
  produtoNome?: string
  depositoId?: number
  estoqueMinimo?: boolean
  estoqueZerado?: boolean
}): Promise<EstoqueItem[]> {
  try {
    let query = `
      SELECT e.*, p.nome as produto_nome, p.codigo as produto_codigo, d.nome as deposito_nome
      FROM estoque e
      JOIN bling_products p ON e.produto_id = p.id
      JOIN depositos d ON e.deposito_id = d.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (filters?.produtoNome) {
      query += ` AND p.nome ILIKE $${paramCount}`
      params.push(`%${filters.produtoNome}%`)
      paramCount++
    }

    if (filters?.depositoId) {
      query += ` AND e.deposito_id = $${paramCount}`
      params.push(filters.depositoId)
      paramCount++
    }

    if (filters?.estoqueMinimo) {
      query += ` AND e.quantidade_disponivel <= COALESCE(e.quantidade_minima, 0)`
    }

    if (filters?.estoqueZerado) {
      query += ` AND e.quantidade_disponivel = 0`
    }

    query += " ORDER BY p.nome, d.nome"

    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar todo estoque:", error)
    throw error
  }
}

export async function createOrUpdateEstoque(
  estoque: Omit<EstoqueItem, "id" | "created_at" | "updated_at">,
): Promise<EstoqueItem> {
  try {
    const result = await pool.query(
      `
      INSERT INTO estoque (
        produto_id, deposito_id, bling_produto_id, bling_deposito_id,
        quantidade_fisica, quantidade_virtual, quantidade_disponivel,
        quantidade_minima, quantidade_maxima, custo_medio, valor_total, localizacao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (produto_id, deposito_id)
      DO UPDATE SET
        bling_produto_id = EXCLUDED.bling_produto_id,
        bling_deposito_id = EXCLUDED.bling_deposito_id,
        quantidade_fisica = EXCLUDED.quantidade_fisica,
        quantidade_virtual = EXCLUDED.quantidade_virtual,
        quantidade_disponivel = EXCLUDED.quantidade_disponivel,
        quantidade_minima = EXCLUDED.quantidade_minima,
        quantidade_maxima = EXCLUDED.quantidade_maxima,
        custo_medio = EXCLUDED.custo_medio,
        valor_total = EXCLUDED.valor_total,
        localizacao = EXCLUDED.localizacao,
        data_ultima_movimentacao = NOW(),
        updated_at = NOW()
      RETURNING *
    `,
      [
        estoque.produto_id,
        estoque.deposito_id,
        estoque.bling_produto_id || null,
        estoque.bling_deposito_id || null,
        estoque.quantidade_fisica,
        estoque.quantidade_virtual,
        estoque.quantidade_disponivel,
        estoque.quantidade_minima || null,
        estoque.quantidade_maxima || null,
        estoque.custo_medio,
        estoque.valor_total,
        estoque.localizacao || null,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Erro ao criar/atualizar estoque:", error)
    throw error
  }
}

export async function movimentarEstoque(
  movimentacao: Omit<MovimentacaoEstoque, "id" | "created_at">,
): Promise<MovimentacaoEstoque> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Buscar estoque atual
    const estoqueAtual = await client.query(
      `
      SELECT * FROM estoque WHERE produto_id = $1 AND deposito_id = $2
    `,
      [movimentacao.produto_id, movimentacao.deposito_id],
    )

    if (estoqueAtual.rows.length === 0) {
      throw new Error("Estoque não encontrado para este produto/depósito")
    }

    const estoque = estoqueAtual.rows[0]
    let novaQuantidade = estoque.quantidade_disponivel

    // Calcular nova quantidade baseada no tipo de movimentação
    switch (movimentacao.tipo_movimentacao) {
      case "ENTRADA":
      case "AJUSTE":
        novaQuantidade = movimentacao.quantidade_nova
        break
      case "SAIDA":
        novaQuantidade = estoque.quantidade_disponivel - movimentacao.quantidade
        break
      case "TRANSFERENCIA":
        // Para transferência, a quantidade é negativa no depósito origem
        novaQuantidade = estoque.quantidade_disponivel + movimentacao.quantidade
        break
      case "INVENTARIO":
        novaQuantidade = movimentacao.quantidade_nova
        break
    }

    // Registrar movimentação
    const movResult = await client.query(
      `
      INSERT INTO movimentacoes_estoque (
        produto_id, deposito_id, tipo_movimentacao, quantidade,
        quantidade_anterior, quantidade_nova, custo_unitario, valor_total,
        motivo, documento, usuario_id, observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
      [
        movimentacao.produto_id,
        movimentacao.deposito_id,
        movimentacao.tipo_movimentacao,
        movimentacao.quantidade,
        estoque.quantidade_disponivel,
        novaQuantidade,
        movimentacao.custo_unitario,
        movimentacao.valor_total,
        movimentacao.motivo || null,
        movimentacao.documento || null,
        movimentacao.usuario_id || null,
        movimentacao.observacoes || null,
      ],
    )

    // Atualizar estoque
    await client.query(
      `
      UPDATE estoque SET
        quantidade_fisica = $3,
        quantidade_virtual = $3,
        quantidade_disponivel = $3,
        custo_medio = CASE 
          WHEN $3 > 0 THEN ($4 + (quantidade_disponivel * custo_medio)) / ($3 + quantidade_disponivel)
          ELSE custo_medio
        END,
        valor_total = $3 * custo_medio,
        data_ultima_movimentacao = NOW(),
        updated_at = NOW()
      WHERE produto_id = $1 AND deposito_id = $2
    `,
      [movimentacao.produto_id, movimentacao.deposito_id, novaQuantidade, movimentacao.valor_total],
    )

    await client.query("COMMIT")
    return movResult.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao movimentar estoque:", error)
    throw error
  } finally {
    client.release()
  }
}

// Funções para Depósitos
export async function getAllDepositos(): Promise<Deposito[]> {
  try {
    const result = await pool.query(`
      SELECT * FROM depositos ORDER BY padrao DESC, nome
    `)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error)
    throw error
  }
}

export async function createDeposito(deposito: Omit<Deposito, "id" | "created_at" | "updated_at">): Promise<Deposito> {
  try {
    const result = await pool.query(
      `
      INSERT INTO depositos (bling_id, nome, descricao, endereco, ativo, padrao)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        deposito.bling_id || null,
        deposito.nome,
        deposito.descricao || null,
        deposito.endereco || null,
        deposito.ativo,
        deposito.padrao,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Erro ao criar depósito:", error)
    throw error
  }
}

// Funções para Alertas
export async function getAlertasEstoque(): Promise<AlertaEstoque[]> {
  try {
    const result = await pool.query(`
      SELECT a.*, p.nome as produto_nome, p.codigo as produto_codigo, d.nome as deposito_nome
      FROM alertas_estoque a
      JOIN bling_products p ON a.produto_id = p.id
      JOIN depositos d ON a.deposito_id = d.id
      WHERE a.resolvido = false
      ORDER BY a.created_at DESC
    `)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar alertas de estoque:", error)
    throw error
  }
}

export async function criarAlertaEstoque(alerta: Omit<AlertaEstoque, "id" | "created_at">): Promise<AlertaEstoque> {
  try {
    const result = await pool.query(
      `
      INSERT INTO alertas_estoque (
        produto_id, deposito_id, tipo_alerta, quantidade_atual, quantidade_minima, data_alerta, resolvido
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (produto_id, deposito_id, tipo_alerta) 
      DO UPDATE SET
        quantidade_atual = EXCLUDED.quantidade_atual,
        data_alerta = EXCLUDED.data_alerta,
        resolvido = false
      RETURNING *
    `,
      [
        alerta.produto_id,
        alerta.deposito_id,
        alerta.tipo_alerta,
        alerta.quantidade_atual,
        alerta.quantidade_minima,
        alerta.data_alerta,
        alerta.resolvido,
      ],
    )
    return result.rows[0]
  } catch (error) {
    console.error("Erro ao criar alerta de estoque:", error)
    throw error
  }
}

// Relatórios
export async function getRelatorioEstoque(): Promise<RelatorioEstoque[]> {
  try {
    const result = await pool.query(`
      SELECT 
        e.produto_id,
        p.nome as produto_nome,
        p.codigo as produto_codigo,
        e.deposito_id,
        d.nome as deposito_nome,
        e.quantidade_fisica,
        e.quantidade_virtual,
        e.quantidade_disponivel,
        COALESCE(e.quantidade_minima, 0) as quantidade_minima,
        e.custo_medio as valor_unitario,
        e.valor_total,
        CASE 
          WHEN e.quantidade_disponivel < 0 THEN 'NEGATIVO'
          WHEN e.quantidade_disponivel = 0 THEN 'ZERADO'
          WHEN e.quantidade_disponivel <= COALESCE(e.quantidade_minima, 0) THEN 'BAIXO'
          ELSE 'OK'
        END as status,
        COALESCE(DATE_PART('day', NOW() - e.data_ultima_movimentacao), 0) as dias_sem_movimentacao
      FROM estoque e
      JOIN bling_products p ON e.produto_id = p.id
      JOIN depositos d ON e.deposito_id = d.id
      ORDER BY 
        CASE 
          WHEN e.quantidade_disponivel < 0 THEN 1
          WHEN e.quantidade_disponivel = 0 THEN 2
          WHEN e.quantidade_disponivel <= COALESCE(e.quantidade_minima, 0) THEN 3
          ELSE 4
        END,
        p.nome
    `)
    return result.rows
  } catch (error) {
    console.error("Erro ao gerar relatório de estoque:", error)
    throw error
  }
}

export async function getMovimentacoesEstoque(
  produtoId?: number,
  depositoId?: number,
  dataInicio?: Date,
  dataFim?: Date,
  limit = 50,
): Promise<MovimentacaoEstoque[]> {
  try {
    let query = `
      SELECT m.*, p.nome as produto_nome, p.codigo as produto_codigo, d.nome as deposito_nome
      FROM movimentacoes_estoque m
      JOIN bling_products p ON m.produto_id = p.id
      JOIN depositos d ON m.deposito_id = d.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (produtoId) {
      query += ` AND m.produto_id = $${paramCount}`
      params.push(produtoId)
      paramCount++
    }

    if (depositoId) {
      query += ` AND m.deposito_id = $${paramCount}`
      params.push(depositoId)
      paramCount++
    }

    if (dataInicio) {
      query += ` AND m.created_at >= $${paramCount}`
      params.push(dataInicio)
      paramCount++
    }

    if (dataFim) {
      query += ` AND m.created_at <= $${paramCount}`
      params.push(dataFim)
      paramCount++
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramCount}`
    params.push(limit)

    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar movimentações de estoque:", error)
    throw error
  }
}
