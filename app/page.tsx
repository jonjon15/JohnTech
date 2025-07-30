export default function HomePage() {
  return (
    <>
      {/* Hero Section Premium */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0a23] animate-fade-in">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-blue-700 via-fuchsia-600 to-transparent opacity-40 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-fuchsia-500 via-blue-400 to-transparent opacity-30 rounded-full blur-2xl animate-pulse-slower" />
        </div>
        <section className="relative z-10 w-full max-w-5xl text-center flex flex-col items-center justify-center py-32">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-fuchsia-400 to-blue-700 drop-shadow-[0_2px_24px_rgba(80,0,255,0.25)] animate-fade-in">
            Gestão de Estoque <span className="text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]">Premium</span>
          </h1>
          <p className="text-2xl md:text-3xl text-neutral-200 max-w-2xl mb-12 animate-fade-in delay-100">
            Controle total, visual moderno e experiência <span className="text-fuchsia-400 font-bold">premium</span> para sua empresa.<br />
            <span className="font-semibold text-blue-400">Simples. Rápido. Profissional.</span>
          </p>
          <div className="flex flex-col md:flex-row gap-5 mb-20 animate-fade-in delay-200">
            <a href="/auth/signin" className="px-12 py-4 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-extrabold text-2xl shadow-2xl hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200 ring-2 ring-fuchsia-400/30 focus:ring-4 focus:ring-fuchsia-400/60 animate-glow">Comece agora</a>
            <a href="/documentacao" className="px-12 py-4 rounded-full border-2 border-fuchsia-400 text-fuchsia-300 font-extrabold text-2xl bg-white/5 hover:bg-fuchsia-400/10 hover:text-white transition-all duration-200 animate-glow">Documentação</a>
          </div>

          {/* Cards de Recursos Premium */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl mb-20 animate-fadein delay-300">
            {/* Card 1 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-fuchsia-400/30 hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200 group animate-card-fadein">
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" className="mb-5 text-blue-400 group-hover:text-fuchsia-400 transition-colors"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h3 className="text-2xl font-extrabold mb-2 text-white drop-shadow">Centralização Total</h3>
              <p className="text-neutral-200">Gerencie produtos, pedidos e integrações em um só lugar, com interface intuitiva e responsiva.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-fuchsia-400/30 hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200 group animate-card-fadein delay-100">
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" className="mb-5 text-blue-400 group-hover:text-fuchsia-400 transition-colors"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h3 className="text-2xl font-extrabold mb-2 text-white drop-shadow">Automação Inteligente</h3>
              <p className="text-neutral-200">Economize tempo com automações, alertas e relatórios inteligentes para decisões rápidas.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-fuchsia-400/30 hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200 group animate-card-fadein delay-200">
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" className="mb-5 text-blue-400 group-hover:text-fuchsia-400 transition-colors"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V9a5 5 0 00-10 0v2a5 5 0 0010 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h3 className="text-2xl font-extrabold mb-2 text-white drop-shadow">Segurança & Suporte</h3>
              <p className="text-neutral-200">Seus dados protegidos com criptografia e suporte humano sempre disponível.</p>
            </div>
            {/* Card 4 - Painel */}
            <a href="/dashboard" className="bg-gradient-to-r from-fuchsia-600 via-blue-700 to-blue-400 rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-fuchsia-400/30 hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200 group animate-card-fadein delay-300">
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" className="mb-5 text-white group-hover:text-fuchsia-100 transition-colors"><path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM3 17h2v-2H3v2zm4 0h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h3 className="text-2xl font-extrabold mb-2 text-white drop-shadow">Painel</h3>
              <p className="text-fuchsia-100">Acesse o dashboard central da sua operação.</p>
              <span className="mt-4 px-8 py-3 rounded-full bg-white/20 text-white font-extrabold shadow hover:bg-white/30 transition-all">Ir para o Painel</span>
            </a>
          </div>

          {/* Integrações Premium */}
          <div className="w-full max-w-3xl bg-gradient-to-r from-blue-900/60 via-fuchsia-900/40 to-blue-900/60 rounded-3xl shadow-2xl p-12 mb-16 flex flex-col md:flex-row items-center gap-8 animate-fadein delay-400 border border-fuchsia-400/30 backdrop-blur-xl">
            <div className="flex-1 text-left">
              <h2 className="text-3xl font-extrabold mb-2 text-white drop-shadow">Integração com os principais ERPs e Marketplaces</h2>
              <p className="text-xl text-fuchsia-200 mb-2">Conecte JohnTech, Mercado Livre, Shopee, Magalu e muito mais em poucos cliques.</p>
              <a href="/configuracao-bling" className="inline-block mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-blue-700 text-white font-extrabold shadow hover:scale-105 hover:bg-fuchsia-700/80 transition-all">Configurar Integração</a>
            </div>
            <div className="flex-1 flex justify-center">
              <img src="/placeholder-logo.svg" alt="Integrações" className="w-40 h-40 object-contain opacity-90 drop-shadow-xl" />
            </div>
          </div>

          {/* Depoimentos */}
          <div className="w-full max-w-4xl mb-20 animate-fadein delay-500">
            <h2 className="text-3xl font-extrabold mb-8 text-white text-center drop-shadow">O que nossos clientes dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow p-6 border border-neutral-100">
                <p className="text-neutral-700 italic mb-3">“A plataforma é intuitiva, rápida e o suporte é excelente. Recomendo para qualquer empresa!”</p>
                <span className="text-blue-700 font-bold">João S.</span>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border border-neutral-100">
                <p className="text-neutral-700 italic mb-3">“Automatizei todo meu estoque e reduzi erros. Visual premium de verdade!”</p>
                <span className="text-blue-700 font-bold">Maria F.</span>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border border-neutral-100">
                <p className="text-neutral-700 italic mb-3">“Integração com o Bling e Mercado Livre sem dor de cabeça. Vale cada centavo.”</p>
                <span className="text-blue-700 font-bold">Carlos M.</span>
              </div>
            </div>
          </div>

          {/* Como funciona */}
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 mb-12 animate-fadein delay-600 border border-neutral-100">
            <h2 className="text-2xl font-bold mb-4 text-neutral-900">Como funciona?</h2>
            <ol className="text-left text-lg text-neutral-700 mx-auto max-w-xl list-decimal list-inside space-y-2">
              <li><b>Cadastro:</b> Clique em <span className="text-blue-700 font-medium">Entrar</span> e preencha seus dados.</li>
              <li><b>Produtos:</b> Após login, acesse <span className="text-blue-700 font-medium">Produtos</span> e cadastre seus itens.</li>
              <li><b>Pedidos:</b> No menu <span className="text-blue-700 font-medium">Pedidos</span>, crie e gerencie suas vendas.</li>
            </ol>
          </div>

          {/* Footer Premium */}
          <footer className="w-full text-neutral-400 text-sm text-center pt-8 animate-fadein delay-700">
            Dúvidas? Consulte a <a href="/docs" className="underline hover:text-blue-700">documentação</a> ou entre em contato com o suporte.<br />
            <span className="text-neutral-300">© {new Date().getFullYear()} JohnTech. Todos os direitos reservados.</span>
          </footer>
        </section>
      </main>
    </>
  );
}
