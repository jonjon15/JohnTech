# Documentação Técnica – Integração Bling Webhooks

## Visão Geral
Este serviço recebe e processa webhooks enviados pelo Bling, garantindo segurança, idempotência e rastreabilidade total dos eventos.

---

## Endpoints

### POST `/api/bling/webhooks`
Recebe eventos do Bling (produtos, pedidos, estoque, notas fiscais, etc).

#### Headers obrigatórios
- `x-bling-signature-256`: Assinatura HMAC SHA-256 do corpo, enviada pelo Bling.

#### Corpo (payload)
```json
{
  "event": "product.created", // ou outro evento suportado
  "eventId": "evt-123456",    // id único do evento (idempotência)
  "companyId": "123456",
  "data": { ... }               // dados do evento conforme tipo
}
```

#### Respostas
- **200 OK** `{ success: true }` – Evento processado com sucesso
- **200 OK** `{ success: true, duplicate: true }` – Evento já processado (idempotência)
- **200 OK** `{ error: "Unauthorized" }` – Assinatura inválida
- **200 OK** `{ error: "Webhook processing failed" }` – Erro interno (detalhes em logs/Sentry)

#### Segurança
- Validação HMAC SHA-256 usando o segredo `BLING_WEBHOOK_SECRET`.
- Responde sempre 200 para evitar flood/retentativas do Bling.
- Idempotência garantida via `eventId` persistido.

---

## Eventos suportados
- `product.created`, `product.updated`, `product.deleted`
- `stock.updated`
- `order.created`, `order.updated`
- `invoice.created`, `invoice.deleted`

Outros eventos são logados, mas não processados.

---

## Logs e rastreabilidade
- Todos os eventos e erros são persistidos na tabela `webhook_events`.
- Erros críticos são enviados ao Sentry.
- Últimos 50 eventos podem ser consultados via GET `/api/bling/webhooks` (apenas para debug/homologação).

---

## Observações
- O corpo do webhook deve ser enviado como texto puro (não como form-data ou multipart).
- O serviço está preparado para rodar em ambiente seguro (HTTPS).
- O rate limit é aplicado para evitar abuso.

---

## Exemplo de chamada (cURL)
```bash
curl -X POST https://seuservidor/api/bling/webhooks \
  -H "x-bling-signature-256: sha256=..." \
  -H "Content-Type: application/json" \
  -d '{ "event": "product.created", "eventId": "evt-123", "companyId": "123", "data": { ... } }'
```

---

## Contato e suporte
Em caso de dúvidas ou problemas, consulte os logs do Sentry ou entre em contato com o time responsável pela integração.
