import { describe, it, expect, vi } from "vitest"
import { GET } from "@/app/api/bling/pedidos/route"

// Mock helpers e dependências conforme necessário

describe("GET /api/bling/pedidos", () => {
  it("deve retornar 401 se não houver token de acesso", async () => {
    // Simula getValidAccessToken retornando null
    vi.mock("@/lib/bling-auth", () => ({
      getValidAccessToken: vi.fn().mockResolvedValue(null),
    }))
    const req = { url: "https://localhost/api/bling/pedidos" }
    // @ts-ignore
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("deve retornar dados dos pedidos se token válido", async () => {
    // Simula getValidAccessToken e fetch
    vi.mock("@/lib/bling-auth", () => ({
      getValidAccessToken: vi.fn().mockResolvedValue("token123"),
    }))
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 1, numero: "123" }] }),
    })
    const req = { url: "https://localhost/api/bling/pedidos" }
    // @ts-ignore
    const res = await GET(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.data).toBeDefined()
  })
})
