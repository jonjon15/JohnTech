# 🛍️ JohnTech - Sistema de Gestão de Produtos

API RESTful para cadastro, atualização, consulta e exclusão de produtos integrada ao Bling ERP.

## 🚀 Status da Homologação
- ✅ Implementação completa
- ✅ Testes automatizados
- 🔄 Em processo de homologação Bling
- ⏳ Aguardando aprovação

## 📋 Funcionalidades
- CRUD completo de produtos
- Sincronização com estoque Bling
- Validação fiscal (NCM, CEST)
- Rate limiting (3req/s, 120k/dia)
- Logs estruturados
- OAuth 2.0

## 🔧 Tecnologias
- Next.js 14
- TypeScript
- Zod (validação)
- Prisma (banco)

## 📖 Documentação
- [Guia de Homologação](./docs/homologacao/README.md)
- [Documentação Técnica dos Endpoints](./docs/homologacao/endpoints.md)
- [Exemplos de Uso](./docs/homologacao/examples.md)
- [Códigos de Erro](./docs/homologacao/errors.md)
- [Changelog](./docs/homologacao/changelog.md)
- [OpenAPI/Swagger](./docs/api/openapi.yaml)
- [Collection Postman](./docs/api/postman-collection.json)

## 🏃‍♂️ Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/jonjon15/JohnTech.git

# Instale dependências
pnpm install

# Configure variáveis ambiente
cp .env.example .env.local

# Execute testes
pnpm test

# Inicie desenvolvimento
pnpm dev
```

## 📞 Suporte
- Email: contato@johntech.com.br
- Docs: https://johntech.com.br/docs
- Issues: https://github.com/jonjon15/JohnTech/issues

---
**Status**: Pronto para Homologação Bling  
**Versão**: 1.0.0  
**Última atualização**: 21/07/2025