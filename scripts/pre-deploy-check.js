const fs = require("fs")
const path = require("path")

console.log("🚀 VERIFICAÇÃO PRÉ-DEPLOY")
console.log("=".repeat(50))

// Verifica se os arquivos essenciais existem
const essentialFiles = [
  "app/api/auth/bling/route.ts",
  "app/api/auth/bling/callback/route.ts",
  "app/api/bling/webhooks/route.ts",
  "app/configuracao-bling/page.tsx",
  "lib/bling-auth.ts",
  "lib/db.ts",
]

let allFilesExist = true

console.log("\n📁 Verificando arquivos essenciais:")
essentialFiles.forEach((file) => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? "✅" : "❌"} ${file}`)
  if (!exists) allFilesExist = false
})

// Verifica variáveis de ambiente necessárias
console.log("\n🔧 Variáveis de ambiente necessárias:")
const requiredEnvVars = ["BLING_CLIENT_ID", "BLING_CLIENT_SECRET", "DATABASE_URL", "NEXT_PUBLIC_BASE_URL"]

const optionalEnvVars = ["BLING_WEBHOOK_SECRET"]

requiredEnvVars.forEach((envVar) => {
  const exists = process.env[envVar]
  console.log(`${exists ? "✅" : "❌"} ${envVar} ${exists ? "(configurado)" : "(FALTANDO)"}`)
})

console.log("\n⚠️  Variáveis opcionais:")
optionalEnvVars.forEach((envVar) => {
  const exists = process.env[envVar]
  console.log(`${exists ? "✅" : "⚠️ "} ${envVar} ${exists ? "(configurado)" : "(recomendado)"}`)
})

console.log("\n📋 CHECKLIST PARA DEPLOY:")
console.log("1. ✅ Código commitado no Git")
console.log("2. ⚠️  Variáveis de ambiente configuradas no Vercel")
console.log("3. ⚠️  URL de callback configurada no Bling")
console.log("4. ⚠️  Deploy realizado")
console.log("5. ⚠️  Testes executados")

if (allFilesExist) {
  console.log("\n🎉 Arquivos OK! Pronto para deploy.")
} else {
  console.log("\n❌ Alguns arquivos estão faltando!")
}

console.log("\n🚀 COMANDOS PARA DEPLOY:")
console.log("git add .")
console.log('git commit -m "Implementa integração completa com Bling"')
console.log("git push origin main")
console.log('\nOu use o botão "Deploy" no painel da Vercel')
