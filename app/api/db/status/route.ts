import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Testar conexão básica
    const timeResult = await sql`SELECT NOW() as current_time`

    // Verificar se a tabela bling_tokens existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bling_tokens'
      ) as table_exists
    `

    // Se a tabela não existir, criar
    if (!tableCheck.rows[0].table_exists) {
      console.log("Tabela bling_tokens não existe. Criando...")

      await sql`
        CREATE TABLE bling_tokens (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) UNIQUE NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      await sql`CREATE INDEX IF NOT EXISTS idx_bling_tokens_user_email ON bling_tokens(user_email)`
      await sql`CREATE INDEX IF NOT EXISTS idx_bling_tokens_expires_at ON bling_tokens(expires_at)`

      console.log("Tabela bling_tokens criada com sucesso")
    }

    // Contar registros na tabela
    const countResult = await sql`SELECT COUNT(*) as count FROM bling_tokens`

    return NextResponse.json({
      success: true,
      database: "connected",
      current_time: timeResult.rows[0].current_time,
      bling_tokens_table: "exists",
      tokens_count: countResult.rows[0].count,
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do banco:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
