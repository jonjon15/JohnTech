# 🚀 Guia de Deploy - Integração Bling

## Pré-requisitos

### 1. Variáveis de Ambiente (Vercel)
Configure estas variáveis no painel da Vercel:

\`\`\`bash
BLING_CLIENT_ID=44866dbd8fe131077d73dbe3d60531016512c855
BLING_CLIENT_SECRET=18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1
BLING_WEBHOOK_SECRET=[gere usando: node scripts/generate-webhook-secret.js]
DATABASE_URL=[sua URL do Neon/Postgres]
NEXT_PUBLIC_BASE_URL=https://johntech.vercel.app
\`\`\`

### 2. Configuração no Bling
- URL de Redirecionamento: `https://johntech.vercel.app/auth/callback`
- URL de Webhook: `https://johntech.vercel.app/api/bling/webhooks`

## Passos para Deploy

### 1. Verificar Arquivos
\`\`\`bash
node scripts/pre-deploy-check.js
\`\`\`

### 2. Commit e Push
\`\`\`bash
git add .
git commit -m "feat: implementa integração completa com Bling API"
git push origin main
\`\`\`

### 3. Deploy Automático
O Vercel fará o deploy automaticamente após o push.

### 4. Verificar Deploy
1. Acesse: https://johntech.vercel.app/configuracao-bling
2. Execute os testes de integração
3. Teste a autenticação OAuth

## Pós-Deploy

### 1. Configurar Banco de Dados
Execute os scripts SQL:
- `scripts/create-database.sql`
- `scripts/seed-sample-data.sql`
- `scripts/verify-and-create-user.sql`

### 2. Testar Integração
1. Acesse `/configuracao-bling`
2. Clique em "Executar Testes de Integração"
3. Todos devem passar ✅

### 3. Configurar Webhooks
1. Gere o webhook secret: `node scripts/generate-webhook-secret.js`
2. Configure no Vercel
3. Configure no painel do Bling

## Troubleshooting

### Erro 500 - Internal Server Error
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs no painel da Vercel

### Erro 404 - Callback não encontrado
- Verifique se a URL no Bling está correta
- Deve ser exatamente: `https://johntech.vercel.app/auth/callback`

### Erro de Banco de Dados
- Verifique se `DATABASE_URL` está configurada
- Execute os scripts SQL de criação das tabelas

## URLs Importantes

- **Site**: https://johntech.vercel.app
- **Configuração**: https://johntech.vercel.app/configuracao-bling
- **Dashboard**: https://johntech.vercel.app/dashboard
- **Webhooks**: https://johntech.vercel.app/webhooks
- **Callback OAuth**: https://johntech.vercel.app/auth/callback
\`\`\`

Agora vamos criar um script de pós-deploy para verificar se tudo funcionou:
