# Documentação dos Endpoints Bling (API Interna)

## Autenticação OAuth
- **Endpoint:** `/api/auth/bling` (inicia o fluxo OAuth)
- **Callback:** `/api/auth` (recebe o code, troca por tokens e armazena)

## Produtos
- **GET** `/api/bling/produtos` — Lista produtos
- Parâmetros: `pagina`, `limite`, `codigo`, `nome`, etc.

## Pedidos de Venda
- **GET** `/api/bling/pedidos` — Lista pedidos
- Parâmetros: `pagina`, `limite`, `situacao`, `numero`

## Estoques
- **GET** `/api/bling/estoques` — Lista estoques
- Parâmetros: `pagina`, `limite`, `idProduto`

## Fornecedores
- **GET** `/api/bling/fornecedores` — Lista fornecedores
- Parâmetros: `pagina`, `limite`, `nome`

## Notas Fiscais
- **GET** `/api/bling/notasfiscais` — Lista notas fiscais
- Parâmetros: `pagina`, `limite`, `numero`, `situacao`

## Webhooks
- **POST** `/api/bling/webhooks` — Recebe eventos do Bling
- Validação de assinatura HMAC, idempotência e logging

---

## Observações
- Todos os endpoints respeitam limites e paginação da API Bling.
- O token de acesso é renovado automaticamente quando necessário.
- Erros são retornados em formato padronizado.

## Exemplos de uso
```http
GET /api/bling/produtos?pagina=1&limite=10
GET /api/bling/pedidos?situacao=aprovado
```

## Testes
- Recomenda-se cobrir os fluxos de autenticação, produtos, pedidos, webhooks e tratamento de erros.
- Testes automatizados devem simular respostas do Bling e cenários de erro/limite.

---

> Mantenha este arquivo atualizado conforme novos recursos forem implementados.
