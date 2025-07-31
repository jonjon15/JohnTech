# JohnTech – Plataforma de Integração Bling

## Visão Geral
JohnTech é uma solução SaaS moderna para integração, automação e gestão de estoques, pedidos e produtos com o Bling ERP. O projeto utiliza Next.js, TypeScript, PostgreSQL (Neon), autenticação OAuth2, webhooks seguros e arquitetura escalável.

---

## Principais Funcionalidades
- **Integração total com Bling**: produtos, pedidos, estoque, notas fiscais
- **Webhooks seguros**: validação HMAC, idempotência, rastreabilidade
- **Autenticação OAuth2**: login seguro e armazenamento criptografado de tokens
- **Dashboard e relatórios**: visão centralizada de integrações e status
- **Logs, auditoria e monitoramento**: Sentry, persistência de eventos, rate limit
- **UI premium e responsiva**: experiência moderna e fluida

---

## Estrutura do Projeto
- `/app` – Páginas, rotas e APIs Next.js
- `/components` – Componentes de UI reutilizáveis
- `/lib` – Helpers, utilitários, integrações externas
- `/scripts` – SQL, utilitários de deploy e seed
- `/docs` – Documentação técnica e exemplos
- `/tests` – Testes automatizados (Vitest)

---

## Como rodar localmente
1. Instale as dependências:
   ```bash
   pnpm install
   ```
2. Configure as variáveis de ambiente (`.env.local`):
   - `CLIENT_ID` (44866dbd8fe131077d73dbe3d60531016512c855), `CLIENT_SECRET` (18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1), `REDIRECT_URI`, `BLING_WEBHOOK_SECRET`, `ENCRYPTION_KEY`, `SENTRY_DSN`, etc.
3. Execute o servidor:
   ```bash
   pnpm dev
   ```
4. Acesse: [https://localhost:3000](https://localhost:3000)

---

## Testes Automatizados
- Execute os testes:
  ```bash
  pnpm exec vitest run --reporter=verbose
  ```
- Testes cobrem webhooks, autenticação, idempotência e fluxos críticos.

---

## Segurança
- Tokens sensíveis criptografados no banco
- Webhooks validados por HMAC
- Rate limit em endpoints críticos
- Monitoramento de erros com Sentry

---

## Documentação
- [docs/bling-webhooks.md](docs/bling-webhooks.md): detalhes dos webhooks
- Documentação de API e exemplos em `/docs`

---

## Suporte
Dúvidas ou problemas? Consulte a documentação ou entre em contato com o time JohnTech.