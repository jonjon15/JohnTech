import { NextRequest, NextResponse } from "next/server";
import { ProdutoSchema } from "./route";
import { rateLimit } from "@/lib/bling-rate-limit";
import { getValidAccessToken } from "@/lib/bling-auth";
import { createProduct } from "@/lib/db";

const BLING_API_BASE = "https://www.bling.com.br/Api/v3";

export async function POST(request: NextRequest) {
  await rateLimit("bling_produtos_importar");
  try {
    const userEmail = request.headers.get("x-user-email") || "";
    if (!userEmail) {
      return NextResponse.json({ error: "E-mail do usuário não informado" }, { status: 401 });
    }
    const accessToken = await getValidAccessToken(userEmail);
    if (!accessToken) {
      return NextResponse.json({ error: "Token de acesso não disponível" }, { status: 401 });
    }
    const { produtos } = await request.json();
    if (!Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json({ error: "Nenhum produto para importar." }, { status: 400 });
    }
    const resultados: any[] = [];
    for (const produto of produtos) {
      try {
        // Validação pelo schema Bling
        const validated = ProdutoSchema.parse(produto);
        // Persistir no banco
        await createProduct({
          nome: validated.nome,
          codigo: validated.codigo ?? "",
          preco: validated.preco ?? 0,
          descricao_curta: validated.descricaoCurta ?? null,
          situacao: validated.situacao,
          tipo: validated.tipo,
          formato: validated.formato,
          bling_id: null,
          estoque: validated.estoque?.maximo ?? null,
        });
        // Enviar para Bling
        const res = await fetch(`${BLING_API_BASE}/produtos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validated),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          resultados.push({ sku: produto.sku, status: "erro", error: err });
        } else {
          resultados.push({ sku: produto.sku, status: "ok" });
        }
      } catch (err: any) {
        resultados.push({ sku: produto.sku, status: "erro", error: err });
      }
    }
    return NextResponse.json({ resultados });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
