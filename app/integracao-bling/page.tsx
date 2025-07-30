"use client"

export default function IntegracaoBlingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <section className="w-full max-w-2xl text-center flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8 text-neutral-900 animate-fadein">
          Integração com Bling
        </h1>
        <ol className="text-left text-lg text-neutral-700 mx-auto max-w-xl mb-8 list-decimal list-inside animate-fadein delay-100">
          <li><b>Autorize o aplicativo:</b> Clique em <span className="text-blue-700 font-medium">Autorizar Bling</span> e siga o fluxo de OAuth2.</li>
          <li><b>Configure o token:</b> Após autorizar, insira o token de acesso na área de integração.</li>
          <li><b>Sincronize seus dados:</b> Após configurar, seus produtos e pedidos serão sincronizados automaticamente.</li>
        </ol>
        <footer className="text-neutral-400 text-sm animate-fadein delay-200">
          Consulte a <a href="/docs" className="underline hover:text-blue-700">documentação</a> para detalhes avançados de integração.
        </footer>
      </section>
    </main>
  );
}
