const https = require("https")

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://johntech.vercel.app"

console.log("🔍 Verificando deploy...\n")

const endpoints = ["/api/auth/bling/status", "/api/bling/webhooks/status", "/api/db/status", "/configuracao-bling"]

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${endpoint}`

    https
      .get(url, (res) => {
        console.log(`${res.statusCode === 200 ? "✅" : "❌"} ${endpoint} - Status: ${res.statusCode}`)
        resolve(res.statusCode === 200)
      })
      .on("error", (err) => {
        console.log(`❌ ${endpoint} - Erro: ${err.message}`)
        resolve(false)
      })
  })
}

async function runChecks() {
  console.log("🌐 Testando endpoints:")

  for (const endpoint of endpoints) {
    await checkEndpoint(endpoint)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Delay entre requests
  }

  console.log("\n🔐 Webhook Secret configurado:")
  console.log(`${process.env.BLING_WEBHOOK_SECRET ? "✅" : "❌"} BLING_WEBHOOK_SECRET`)

  console.log("\n🎉 Deploy verificado!")
  console.log(`🔗 Acesse: ${baseUrl}/configuracao-bling`)
}

runChecks().catch(console.error)
