import { sql } from "@vercel/postgres"

export { sql }

// Função para testar conexão
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("Database connection successful:", result.rows[0])
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Database connection failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
