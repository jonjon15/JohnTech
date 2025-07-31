# 🚀 Guia de Deploy - BlingPro

## Pré-requisitos

- [x] Conta no Bling com aplicação criada
- [x] Projeto no Vercel conectado ao GitHub
- [x] Banco PostgreSQL configurado (Neon)

## 1. Variáveis de Ambiente

Configure no Vercel (Settings → Environment Variables):

\`\`\`env
CLIENT_ID=44866dbd8fe131077d73dbe3d60531016512c855
CLIENT_SECRET=18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1
BLING_WEBHOOK_SECRET=09cd0c191a2d7d849609870b9166ab3b74e76ba95df54f0237bce24fb2af1e8b
BLING_API_URL=https://www.bling.com.br/Api/v3
DATABASE_URL=sua_url_do_postgres
NEXT_PUBLIC_BASE_URL=https://johntech.vercel.app
\`\`\`

## 2. Deploy

\`\`\`bash
# Verificar se está tudo pronto
node scripts/pre-deploy-check.js

# Fazer commit e push
git add .
git commit -m "feat: integração Bling completa"
git push origin main

# Aguardar deploy automático no Vercel
\`\`\`

## 3. Pós-Deploy

\`\`\`bash
# Verificar se deploy funcionou
node scripts/post-deploy-check.js

# Executar scripts do banco (se necessário)
# No painel da Vercel ou localmente
\`\`\`

## 4. Configurar no Bling

1. Acesse: https://www.bling.com.br
2. Vá em: Configurações → Aplicações → Sua App
3. Configure:
   - **URL de Callback**: `https://johntech.vercel.app/auth/callback`
   - **URL de Webhook**: `https://johntech.vercel.app/api/bling/webhooks`
   - **Webhook Secret**: `09cd0c191a2d7d849609870b9166ab3b74e76ba95df54f0237bce24fb2af1e8b`

## 5. Testar

1. Acesse: https://johntech.vercel.app/configuracao-bling
2. Execute "Testes de Integração"
3. Todos devem passar ✅

## 6. Monitoramento

- Status da API: `/api/bling/status`
- Status Auth: `/api/auth/bling/status`  
- Status DB: `/api/db/status`
- Status Webhooks: `/api/bling/webhooks/status`

## Troubleshooting

### Erro 500 na autenticação
- Verificar se `CLIENT_ID` e `CLIENT_SECRET` estão corretos
- Verificar se a URL de callback está configurada no Bling

### Webhooks não funcionam
- Verificar se `BLING_WEBHOOK_SECRET` está configurado
- Verificar se a URL está acessível publicamente
- Verificar logs no Vercel

### Erro de banco
- Verificar se `DATABASE_URL` está correto
- Executar scripts de criação de tabelas
