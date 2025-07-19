import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

/**
 * Endpoint para verificar status do banco de dados
 */
export async function GET() {
  try {
    const pool = getPool()

    // Testa conexão básica
    const startTime = Date.now()
    await pool.query("SELECT 1")
    const responseTime = Date.now() - startTime

    // Verifica tabelas principais
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'bling_%'
      ORDER BY table_name
    `)

    const tables = tablesResult.rows.map((row) => row.table_name)

    // Conta registros nas tabelas principais
    const counts: Record<string, number> = {}
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
        counts[table] = Number.parseInt(countResult.rows[0].count)
      } catch (error) {
        counts[table] = -1 // Erro ao contar
      }
    }

    // Verifica últimas atividades
    const lastActivities: Record<string, Date | null> = {}
    for (const table of ["bling_produtos", "bling_pedidos", "bling_contatos", "bling_webhook_logs"]) {
      if (tables.includes(table)) {
        try {
          const result = await pool.query(`SELECT MAX(created_at) as last_activity FROM ${table}`)
          lastActivities[table] = result.rows[0].last_activity
        } catch (error) {
          lastActivities[table] = null
        }
      }
    }

    const status = {
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        tables: {
          total: tables.length,
          list: tables,
        },
        records: counts,
        lastActivities,
      },
      overall: {
        status: "healthy",
        message: "Banco de dados funcionando normalmente",
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("❌ Erro ao verificar status do banco:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
        overall: {
          status: "error",
          message: "Erro de conexão com o banco de dados",
        },
      },
      { status: 500 },
    )
  }
}
