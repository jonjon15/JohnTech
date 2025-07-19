import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Testar conexão com o banco
    const result = await sql`SELECT NOW() as current_time`

    // Verificar se a tabela de tokens existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bling_tokens'
      )
    `

    const tableExists = tableCheck.rows[0].exists

    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Tabela bling_tokens não existe. Execute o script de criação do banco.",
          connected: true,
          table_exists: false,
        },
        { status: 500 },
      )
    }

    // Verificar tokens existentes
    const tokenCount = await sql`SELECT COUNT(*) as count FROM bling_tokens`

    return NextResponse.json({
      success: true,
      message: "Banco de dados funcionando corretamente",
      connected: true,
      table_exists: true,
      token_count: Number.parseInt(tokenCount.rows[0].count),
      current_time: result.rows[0].current_time,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao conectar com o banco de dados",
        connected: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
