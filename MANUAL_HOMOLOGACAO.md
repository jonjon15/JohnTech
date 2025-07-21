# Manual de Homologação - Integração BlingPro

## 1. Introdução
Este manual descreve o processo de homologação da integração entre o BlingPro e o Bling ERP, seguindo as exigências da TOTVS/Bling para aprovação de aplicativos.

## 2. Fluxo de Homologação
- **Autenticação OAuth2:** O usuário autoriza o app via OAuth2, gerando access_token e refresh_token.
- **CRUD de Produtos de Homologação:** O app permite criar, listar, atualizar e excluir produtos de homologação via API.
- **Webhooks:** O app recebe e processa webhooks de produto criado, atualizado, excluído e alteração de estoque.

## 3. Passo a Passo para Testes
### 3.1. Autenticação
1. Acesse a tela de homologação do BlingPro.
2. Clique em "Conectar ao Bling" e siga o fluxo OAuth2.
3. Após autenticar, o status "Auth" ficará verde.

### 3.2. CRUD de Produtos
1. Na aba "Testes", clique em "Executar Todos os Testes".
2. O sistema irá:
   - Criar um produto de homologação
   - Atualizar o produto criado
   - Excluir o produto criado
3. Todos os status devem ficar verdes.

### 3.3. Webhooks
1. No painel do Bling, cadastre o endpoint `/api/bling/webhooks`.
2. Execute operações de produto (criar, atualizar, excluir) e estoque.
3. Verifique se os webhooks são recebidos (logs ou painel do app).

## 4. Endpoints Utilizados
- **Produtos:**
  - `GET /api/bling/homologacao/produtos`
  - `POST /api/bling/homologacao/produtos`
  - `PUT /api/bling/homologacao/produtos/:id`
  - `DELETE /api/bling/homologacao/produtos/:id`
- **Webhooks:**
  - `POST /api/bling/webhooks`

## 5. Limites e Boas Práticas
- Respeite o limite de requisições da API Bling (consultar documentação oficial).
- Trate erros e exiba mensagens amigáveis ao usuário.
- Utilize o campo `state` no OAuth2 para segurança.

## 6. Suporte
Em caso de dúvidas ou problemas, entre em contato pelo e-mail: suporte@blingpro.com.br

---

**Observação:**
- Todos os testes devem passar sem erros para aprovação.
- Prints dos testes e logs de webhooks podem ser solicitados pela equipe Bling.
- Este manual pode ser atualizado conforme novas exigências da TOTVS/Bling.
