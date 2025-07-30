
"use client";

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg mb-6 text-center">Dashboard</h1>
        <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-white/10 backdrop-blur-md transition-all duration-500">
            <h3 className="text-xl font-bold mb-2 text-[#7F9FFF]">Produtos</h3>
            <p className="text-white/80 mb-2">Gerencie e monitore todos os produtos integrados ao JohnTech.</p>
            <a href="/produtos" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">Ver Produtos</a>
          </div>
          <div className="bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-white/10 backdrop-blur-md transition-all duration-500">
            <h3 className="text-xl font-bold mb-2 text-[#7F9FFF]">Pedidos</h3>
            <p className="text-white/80 mb-2">Acompanhe e gerencie seus pedidos de venda.</p>
            <a href="/pedidos" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">Ver Pedidos</a>
          </div>
          <div className="bg-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-white/10 backdrop-blur-md transition-all duration-500">
            <h3 className="text-xl font-bold mb-2 text-[#7F9FFF]">Documentação</h3>
            <p className="text-white/80 mb-2">Consulte a documentação e checklist de integração.</p>
            <a href="/documentacao" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">Ver Documentação</a>
          </div>
        </section>
        <section className="w-full max-w-2xl bg-white/10 rounded-2xl shadow-2xl p-8 mb-12 border border-white/10 backdrop-blur-md transition-all duration-500">
          <h2 className="text-2xl font-bold mb-4 text-white/90">Como usar o Painel?</h2>
          <ol className="text-left text-lg text-white/80 mx-auto max-w-xl list-decimal list-inside space-y-2">
            <li>Acesse os cards acima para navegar entre produtos, pedidos e documentação.</li>
            <li>Monitore o status das integrações e consulte logs no menu.</li>
            <li>Em caso de dúvidas, acesse a documentação ou entre em contato com o suporte.</li>
          </ol>
        </section>
      <footer className="w-full text-neutral-400 text-sm text-center pt-8 animate-fadein delay-400">
        Dúvidas? Consulte a <a href="/documentacao" className="underline hover:text-blue-700">documentação</a> ou entre em contato com o suporte.<br />
        <span className="text-neutral-300">© {new Date().getFullYear()} JohnTech. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}
