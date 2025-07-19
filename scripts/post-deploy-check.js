const https = require("https")

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://johntech.vercel.app"

console.log("🔍 VERIFICAÇÃO PÓS-DEPLOY")
console.log("=".repeat(50))
console.log(`Testando: ${BASE_URL}`)

const endpoints = [
  { path: "/", name: "Página Principal" },
  { path: "/configuracao-bling", name: "Configuração Bling" },
  { path: "/api/auth/bling/status", name: "Status OAuth" },
  { path: "/api/db/status", name: "Status Banco" },
  { path: "/api/bling/webhooks/status", name: "Status Webhooks" },
]

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.path}`

    https
      .get(url, (res) => {
        const status = res.statusCode
        const success = status >= 200 && status < 400

        console.log(`${success ? "✅" : "❌"} ${endpoint.name}: ${status}`)
        resolve({ success, status })
      })
      .on("error", (err) => {
        console.log(`❌ ${endpoint.name}: ERRO - ${err.message}`)
        resolve({ success: false, error: err.message })
      })
  })
}

async function runTests() {
  console.log("\n🧪 Testando endpoints...\n")

  let allPassed = true

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint)
    if (!result.success) allPassed = false

    // Pequena pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log("\n" + "=".repeat(50))

  if (allPassed) {
    console.log("🎉 DEPLOY REALIZADO COM SUCESSO!")
    console.log("✅ Todos os endpoints estão respondendo")
    console.log("\n📋 Próximos passos:")
    console.log("1. Configure as variáveis de ambiente se ainda não fez")
    console.log("2. Execute os scripts SQL do banco de dados")
    console.log("3. Configure a URL de callback no Bling")
    console.log("4. Teste a autenticação OAuth")
  } else {
    console.log("⚠️  DEPLOY COM PROBLEMAS")
    console.log("❌ Alguns endpoints não estão funcionando")
    console.log("\n🔧 Verifique:")
    console.log("- Variáveis de ambiente no Vercel")
    console.log("- Logs de erro no painel da Vercel")
    console.log("- Configuração do banco de dados")
  }
}

runTests().catch(console.error)
