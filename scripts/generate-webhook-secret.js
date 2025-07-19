const crypto = require("crypto")

console.log("🔐 Gerando Webhook Secret...\n")

const secret = crypto.randomBytes(32).toString("hex")

console.log("Seu Webhook Secret:")
console.log("=".repeat(70))
console.log(secret)
console.log("=".repeat(70))
console.log("\n📋 Próximos passos:")
console.log("1. Copie o secret acima")
console.log("2. Configure no Vercel: BLING_WEBHOOK_SECRET")
console.log("3. Use o mesmo secret no painel do Bling")
console.log("\n🔗 Para configurar no Vercel:")
console.log(`BLING_WEBHOOK_SECRET=${secret}`)
