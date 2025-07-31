// Simple in-memory rate limiter (per endpoint)
// Limite: 3 requisições por segundo por endpoint
// Uso: await rateLimit("bling_sync")

const rateLimits: Record<string, { count: number; lastReset: number }> = {}
const MAX_REQUESTS_PER_SECOND = 3

export async function rateLimit(key: string): Promise<void> {
  const now = Date.now()
  if (!rateLimits[key] || now - rateLimits[key].lastReset > 1000) {
    rateLimits[key] = { count: 1, lastReset: now }
    return
  }
  if (rateLimits[key].count < MAX_REQUESTS_PER_SECOND) {
    rateLimits[key].count++
    // Alerta se atingir 80% do limite
    if (rateLimits[key].count === Math.floor(MAX_REQUESTS_PER_SECOND * 0.8)) {
      console.warn(`[RateLimit] Atenção: ${key} atingiu 80% do limite de ${MAX_REQUESTS_PER_SECOND} req/s.`)
    }
    return
  }
  // Se excedeu o limite, aguarda até o próximo segundo
  const wait = 1000 - (now - rateLimits[key].lastReset)
  console.warn(`[RateLimit] Limite atingido para ${key}. Aguardando ${wait}ms.`)
  await new Promise((resolve) => setTimeout(resolve, wait))
  rateLimits[key] = { count: 1, lastReset: Date.now() }
}
