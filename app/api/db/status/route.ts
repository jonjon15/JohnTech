import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("=== VERIFICANDO STATUS DO BANCO ===")

    // Testar conexão básica
    const connectionTest = await sql`SELECT NOW() as current_time`

    console.log("Conexão com banco OK:", connectionTest.rows[0])

    // Verificar se tabela bling_tokens existe
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bling_tokens'
      ) as table_exists
    `

    const tableExists = tableCheck.rows[0].table_exists

    console.log("Tabela bling_tokens existe:", tableExists)

    // Se tabela não existe, criar
    if (!tableExists) {
      console.log("Criando tabela bling_tokens...")

      await sql`
        CREATE TABLE IF NOT EXISTS bling_tokens (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) UNIQUE NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `

      console.log("Tabela bling_tokens criada com sucesso")
    }

    // Contar tokens
    const tokenCount = await sql`SELECT COUNT(*) as count FROM bling_tokens`

    console.log("Número de tokens no banco:", tokenCount.rows[0].count)

    return NextResponse.json({
      status: "success",
      message: "Banco de dados funcionando",
      database_status: "up",
      table_exists: true,
      token_count: Number.parseInt(tokenCount.rows[0].count),
      current_time: connectionTest.rows[0].current_time,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro no status do banco:", error)

    return NextResponse.json({
      status: "error",
      message: "Erro no banco de dados",
      details: error.message,
      database_status: "down",
      timestamp: new Date().toISOString(),
    })
  }
}
