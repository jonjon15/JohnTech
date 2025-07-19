const https = require("https")

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://johntech.vercel.app"

console.log("🚀 Verificando deploy...\n")

const endpoints = ["/api/auth/bling/status", "/api/bling/status", "/api/db/status", "/configuracao-bling"]

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`

    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ ${endpoint} - OK`)
          resolve(true)
        } else {
          console.log(`❌ ${endpoint} - Status: ${res.statusCode}`)
          resolve(false)
        }
      })
      .on("error", (err) => {
        console.log(`❌ ${endpoint} - Erro: ${err.message}`)
        resolve(false)
      })
  })
}

async function runChecks() {
  console.log(`Testando endpoints em: ${BASE_URL}\n`)

  const results = await Promise.all(endpoints.map((endpoint) => checkEndpoint(endpoint)))

  const allPassed = results.every((result) => result)

  console.log("\n📋 RESUMO:")
  if (allPassed) {
    console.log("🎉 Deploy funcionando perfeitamente!")
  } else {
    console.log("⚠️  Alguns endpoints falharam - verifique os logs")
  }
}

runChecks()
