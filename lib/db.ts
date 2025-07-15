import { neon } from "@neondatabase/serverless"

// Certifique-se de que DATABASE_URL está configurada nas variáveis de ambiente do Vercel
const sql = neon(process.env.DATABASE_URL!)

export { sql }
