const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando pré-requisitos para deploy...\n")

const requiredFiles = [
  "app/api/auth/bling/route.ts",
  "app/api/auth/bling/callback/route.ts",
  "app/api/bling/webhooks/route.ts",
  "lib/bling-auth.ts",
  "next.config.mjs",
]

let allFilesExist = true

console.log("📁 Verificando arquivos essenciais:")
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - ARQUIVO FALTANDO`)
    allFilesExist = false
  }
})

console.log("\n🔧 Verificando variáveis de ambiente...")
const requiredEnvVars = [
  "BLING_CLIENT_ID",
  "BLING_CLIENT_SECRET",
  "BLING_WEBHOOK_SECRET",
  "DATABASE_URL",
  "NEXT_PUBLIC_BASE_URL",
]

let allEnvVarsSet = true

requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`)
  } else {
    console.log(`⚠️  ${envVar} - NÃO CONFIGURADA`)
    allEnvVarsSet = false
  }
})

console.log("\n📋 RESUMO:")
if (allFilesExist && allEnvVarsSet) {
  console.log("🎉 Tudo pronto para deploy!")
  process.exit(0)
} else {
  console.log("❌ Corrija os problemas antes do deploy")
  process.exit(1)
}
