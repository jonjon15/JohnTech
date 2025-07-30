import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Testa a conexão e retorna o número de produtos cadastrados (exemplo)
    const result = await sql`SELECT COUNT(*)::int AS total FROM bling_products`;
    return NextResponse.json({
      status: "ok",
      totalProdutos: result.rows[0]?.total ?? 0,
      message: "Conexão com banco de dados bem-sucedida!"
    });
  } catch (error) {
    return NextResponse.json({
      status: "erro",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
