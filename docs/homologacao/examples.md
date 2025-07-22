# 📦 Exemplos de Uso - API Bling

## Exemplo de GET
```http
GET /api/bling/produtos/123
Authorization: Bearer <token>
```

## Exemplo de PUT
```http
PUT /api/bling/produtos/123
Content-Type: application/json
Authorization: Bearer <token>
{
  "nome": "Produto Teste",
  "preco": 99.9,
  "situacao": "A"
}
```

## Exemplo de DELETE
```http
DELETE /api/bling/produtos/123
Authorization: Bearer <token>
```

## Exemplo de POST
```http
POST /api/bling/produtos
Content-Type: application/json
Authorization: Bearer <token>
{
  "nome": "Novo Produto",
  "preco": 49.9,
  "situacao": "A"
}
```
