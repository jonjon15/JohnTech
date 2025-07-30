// API Route para tratar autenticação OAuth do Bling
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // TODO: Implementar callback OAuth, salvar tokens e redirecionar usuário
  return NextResponse.json({ ok: true });
}
