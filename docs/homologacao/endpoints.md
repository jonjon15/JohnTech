# 📚 Endpoints Técnicos - Homologação Bling

## GET /api/bling/produtos/{id}
- Busca produto por ID
- Parâmetros: id (integer, obrigatório)
- Resposta: 200 (produto), 404 (não encontrado), 400 (id inválido)

## PUT /api/bling/produtos/{id}
- Atualiza produto
- Parâmetros: id (integer, obrigatório)
- Body: JSON conforme schema ProdutoHomologacaoSchema
- Resposta: 200 (atualizado), 404 (não encontrado), 400 (validação)

## DELETE /api/bling/produtos/{id}
- Remove produto
- Parâmetros: id (integer, obrigatório)
- Resposta: 200 (removido), 404 (não encontrado), 400 (id inválido)

## POST /api/bling/produtos
- Cria produto
- Body: JSON conforme schema ProdutoHomologacaoSchema
- Resposta: 201 (criado), 400 (validação)
