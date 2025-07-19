/**
 * Rate Limiter baseado nos limites da API Bling
 * Documentação: https://developer.bling.com.br/limites
 */

interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
}

export class BlingRateLimiter {
  private requests: { timestamp: number; endpoint: string }[] = []
  private config: RateLimitConfig

  constructor(
    config: RateLimitConfig = {
      requestsPerMinute: 60,
      requestsPerHour: 3600,
      requestsPerDay: 86400,
    },
  ) {
    this.config = config
  }

  async checkLimit(endpoint: string): Promise<boolean> {
    const now = Date.now()

    // Limpar requests antigos
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < 24 * 60 * 60 * 1000, // 24 horas
    )

    // Verificar limites
    const lastMinute = this.requests.filter((req) => now - req.timestamp < 60 * 1000)
    const lastHour = this.requests.filter((req) => now - req.timestamp < 60 * 60 * 1000)
    const lastDay = this.requests.filter((req) => now - req.timestamp < 24 * 60 * 60 * 1000)

    if (lastMinute.length >= this.config.requestsPerMinute) {
      throw new Error("Rate limit exceeded: requests per minute")
    }

    if (lastHour.length >= this.config.requestsPerHour) {
      throw new Error("Rate limit exceeded: requests per hour")
    }

    if (lastDay.length >= this.config.requestsPerDay) {
      throw new Error("Rate limit exceeded: requests per day")
    }

    // Registrar request
    this.requests.push({ timestamp: now, endpoint })
    return true
  }

  getStats() {
    const now = Date.now()
    const lastMinute = this.requests.filter((req) => now - req.timestamp < 60 * 1000)
    const lastHour = this.requests.filter((req) => now - req.timestamp < 60 * 60 * 1000)
    const lastDay = this.requests.filter((req) => now - req.timestamp < 24 * 60 * 60 * 1000)

    return {
      lastMinute: lastMinute.length,
      lastHour: lastHour.length,
      lastDay: lastDay.length,
      limits: this.config,
    }
  }
}
