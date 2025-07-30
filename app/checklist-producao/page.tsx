import React from "react";
import Link from "next/link";

export default function ChecklistProducao() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Checklist de Produção: Integração Bling</h1>
      <ol className="list-decimal pl-6 space-y-6">
        <li>
          <b>Configuração do App no Bling</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Cadastre seu aplicativo no <Link href="https://developer.bling.com.br/aplicativos#como-cadastrar" target="_blank" className="underline">painel de desenvolvedor do Bling</Link>.</li>
            <li>Guarde o <code>client_id</code> e <code>client_secret</code> com segurança.</li>
          </ul>
        </li>
        <li>
          <b>Implementação do Fluxo OAuth</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Implemente o fluxo de autorização OAuth 2.0 para obter o <code>access_token</code> do usuário Bling.</li>
            <li>Salve o token de forma segura e nunca exponha o <code>client_secret</code> no frontend.</li>
            <li>Veja o <Link href="https://developer.bling.com.br/aplicativos#fluxo-de-autorizacao" target="_blank" className="underline">fluxo de autorização</Link>.</li>
          </ul>
        </li>
        <li>
          <b>Endpoints de Produtos, Estoques e Fornecedores</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Implemente chamadas para os endpoints da API v3 do Bling:</li>
            <li><code>/produtos</code> – listar/cadastrar produtos</li>
            <li><code>/estoques</code> – consultar/atualizar estoques</li>
            <li><code>/produtos-fornecedores</code> – fornecedores</li>
            <li>Consulte a <Link href="https://developer.bling.com.br/referencia" target="_blank" className="underline">documentação de referência</Link>.</li>
          </ul>
        </li>
        <li>
          <b>Tratamento de Webhooks</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Implemente endpoints para receber webhooks do Bling.</li>
            <li>Valide o hash HMAC do header <code>X-Bling-Signature-256</code> para garantir autenticidade.</li>
            <li>Veja <Link href="https://developer.bling.com.br/webhooks#validação-do-hash" target="_blank" className="underline">como validar o hash</Link>.</li>
          </ul>
        </li>
        <li>
          <b>Tratamento de Erros e Limites</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Implemente tratamento para erros HTTP (400, 401, 403, 429, 500).</li>
            <li>Respeite os limites de requisições: <b>3/s</b> e <b>120.000/dia</b>.</li>
            <li>Veja <Link href="https://developer.bling.com.br/erros-comuns#introdução" target="_blank" className="underline">erros comuns</Link> e <Link href="https://developer.bling.com.br/limites#requisições" target="_blank" className="underline">limites</Link>.</li>
          </ul>
        </li>
        <li>
          <b>Testes Finais</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Faça testes reais com uma conta Bling de homologação.</li>
            <li>Valide se produtos e estoques estão sendo recebidos/processados corretamente.</li>
          </ul>
        </li>
        <li>
          <b>Infraestrutura e Segurança</b>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            <li>Garanta backend seguro, com HTTPS e variáveis sensíveis protegidas.</li>
            <li>Configure logs e monitoramento para integrações e webhooks.</li>
          </ul>
        </li>
      </ol>
      <div className="mt-10 text-xs text-gray-500">
        Dúvidas? Consulte a <Link href="https://developer.bling.com.br/" target="_blank" className="underline">documentação oficial do Bling</Link> ou peça exemplos de código aqui!
      </div>
    </main>
  );
}
