# Checklist de Integração Google Drive Picker

## 1. Google Cloud Console
- [ ] Criar um projeto no [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Ativar as APIs:
  - [ ] Google Drive API
  - [ ] Google Picker API
- [ ] Configurar tela de consentimento OAuth
- [ ] Criar credenciais OAuth 2.0 (tipo: Web)
  - [ ] Adicionar URI de redirecionamento autorizado (ex: http://localhost:3000)
  - [ ] Salvar o Client ID e Client Secret

## 2. Frontend
- [ ] Instalar dependências necessárias (ex: googleapis, script loader)
- [ ] Implementar botão "Selecionar do Google Drive"
- [ ] Integrar Google Picker para seleção/upload de imagem
- [ ] Obter o link do arquivo selecionado

## 3. Permissões e Link Público
- [ ] Tornar o arquivo selecionado público automaticamente via API
- [ ] Preencher o campo de imagem do produto com o link público
- [ ] Exibir preview da imagem

## 4. Backend (opcional)
- [ ] Se necessário, criar endpoint para lidar com tokens OAuth2 de forma segura

## 5. Testes
- [ ] Testar fluxo completo em ambiente local
- [ ] Testar em produção

---

> Para cada etapa, marque como concluída e anote dúvidas ou problemas encontrados.
