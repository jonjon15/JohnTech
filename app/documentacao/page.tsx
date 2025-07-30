import React from "react";
import Link from "next/link";

export default function DocumentacaoPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg mb-6 text-center">Documentação & Guia Rápido</h1>
      <section className="w-full max-w-3xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white/90">Visão Geral</h2>
        <p className="mb-2 text-lg">Esta aplicação integra o Bling ERP para gestão de produtos, estoques e fornecedores, utilizando a API oficial do Bling (v3, padrão REST, OAuth 2.0).</p>
        <p className="text-white/70">Todos os fluxos seguem as melhores práticas de segurança, tratamento de erros e performance recomendadas pela documentação oficial.</p>
      </section>
      <section className="w-full max-w-3xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white/90">Fluxos Principais</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li><b>Autenticação OAuth 2.0:</b> Fluxo seguro para obter o <code>access_token</code> do usuário Bling. <Link href="/auth" className="underline text-[#7F9FFF]">Ver página de autenticação</Link></li>
          <li><b>Produtos:</b> Listagem, cadastro e atualização de produtos via API. <Link href="/produtos" className="underline text-[#7F9FFF]">Ver produtos</Link></li>
          <li><b>Pedidos:</b> Cadastro e acompanhamento de pedidos. <Link href="/pedidos" className="underline text-[#7F9FFF]">Ver pedidos</Link></li>
          <li><b>Estoques:</b> Consulta e atualização de estoques integrados. <Link href="/estoques" className="underline text-[#7F9FFF]">Ver estoques</Link></li>
          <li><b>Fornecedores:</b> Gestão de fornecedores vinculados ao Bling. <Link href="/fornecedores" className="underline text-[#7F9FFF]">Ver fornecedores</Link></li>
          <li><b>Webhooks:</b> Recebimento e validação de eventos do Bling. <Link href="/api/webhooks" className="underline text-[#7F9FFF]">Endpoint de webhooks</Link></li>
          <li><b>Painel:</b> Status das integrações, logs e alertas. <Link href="/dashboard" className="underline text-[#7F9FFF]">Ver painel</Link></li>
        </ul>
      </section>
      <section className="w-full max-w-3xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white/90">Boas Práticas e Segurança</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg text-white/80">
          <li>Tokens e segredos nunca são expostos no frontend.</li>
          <li>Validação de hash HMAC em todos os webhooks recebidos (<code>X-Bling-Signature-256</code>).</li>
          <li>Tratamento de erros HTTP e limites de requisições (3/s, 120.000/dia).</li>
          <li>Paginação e filtros implementados para grandes volumes de dados.</li>
          <li>Logs detalhados de integrações e eventos.</li>
          <li>Checklist de produção disponível <Link href="/checklist-producao" className="underline text-[#7F9FFF]">aqui</Link>.</li>
        </ul>
      </section>
      <section className="w-full max-w-3xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white/90">Links Úteis</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li><Link href="https://developer.bling.com.br/bling-api#introducao" target="_blank" className="underline text-[#7F9FFF]">Documentação oficial Bling API</Link></li>
          <li><Link href="https://developer.bling.com.br/aplicativos#fluxo-de-autorizacao" target="_blank" className="underline text-[#7F9FFF]">Fluxo OAuth 2.0</Link></li>
          <li><Link href="https://developer.bling.com.br/webhooks#validação-do-hash" target="_blank" className="underline">Webhooks e validação de hash</Link></li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-extrabold mb-2 text-white/95 drop-shadow">História do Projeto</h2>
        <p className="text-white/90 text-lg font-medium drop-shadow-sm">Este projeto foi desenvolvido para ser uma base robusta, escalável e segura para integrações com o Bling ERP, seguindo rigorosamente a documentação oficial e as melhores práticas de desenvolvimento web moderno. O objetivo é facilitar a gestão de estoques, produtos e fornecedores, além de garantir rastreabilidade e segurança em todos os fluxos de dados.</p>
        <div className="mt-4 p-4 bg-blue-900/70 border-l-4 border-blue-400 text-white/90 rounded shadow-lg">
          <b className="text-white font-bold">Dica:</b> Use o menu superior para navegar entre <span className="text-[#7F9FFF] font-semibold">Painel, Produtos, Pedidos</span> e <span className="text-[#7F5AF0] font-semibold">Documentação</span>. Todos os fluxos estão integrados e prontos para uso!
        </div>
      </section>
      <footer className="text-xs text-gray-500 mt-10">
        Dúvidas? Consulte a documentação oficial ou entre em contato com o time de desenvolvimento.
      </footer>
    </div>
  );
}
