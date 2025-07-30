// API Route para receber webhooks do Bling
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: Validar hash HMAC do header X-Bling-Signature-256
  // TODO: Processar evento recebido
  return NextResponse.json({ ok: true });
}
