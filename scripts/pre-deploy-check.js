const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando se está tudo pronto para deploy...\n")

// Lista de arquivos essenciais
const requiredFiles = [
  "app/api/auth/bling/route.ts",
  "app/api/auth/bling/callback/route.ts",
  "app/api/bling/webhooks/route.ts",
  "app/configuracao-bling/page.tsx",
  "lib/bling-auth.ts",
]

// Lista de variáveis de ambiente necessárias
const requiredEnvVars = [
  "BLING_CLIENT_ID",
  "BLING_CLIENT_SECRET",
  "BLING_WEBHOOK_SECRET",
  "DATABASE_URL",
  "NEXT_PUBLIC_BASE_URL",
]

let allGood = true

// Verificar arquivos
console.log("📁 Verificando arquivos essenciais:")
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`${exists ? "✅" : "❌"} ${file}`)
  if (!exists) allGood = false
})

console.log("\n🔐 Variáveis de ambiente necessárias:")
requiredEnvVars.forEach((envVar) => {
  const exists = process.env[envVar]
  console.log(`${exists ? "✅" : "❌"} ${envVar}`)
  if (!exists) allGood = false
})

console.log("\n📦 Verificando package.json...")
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
const requiredDeps = ["next", "@vercel/postgres", "crypto"]
requiredDeps.forEach((dep) => {
  const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep]
  console.log(`${exists ? "✅" : "❌"} ${dep}`)
  if (!exists) allGood = false
})

if (allGood) {
  console.log("\n🚀 Tudo pronto para deploy!")
  console.log('Execute: git add . && git commit -m "feat: integração Bling completa" && git push')
} else {
  console.log("\n❌ Alguns itens precisam ser corrigidos antes do deploy")
}
