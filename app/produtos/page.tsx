"use client";

import { useSession } from "next-auth/react";

export default function ProdutosPage() {
  const { data: session } = useSession();
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg mb-6 text-center">Produtos</h1>
      <section className="w-full max-w-3xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90">
        <p className="text-lg md:text-xl mb-6">Adicione, edite e visualize seus produtos cadastrados de forma simples, moderna e <span className="font-bold text-[#7F9FFF]">premium</span>.</p>
        <div className="text-white/70 text-center mb-2">
          (Funcionalidade de cadastro/listagem de produtos em breve)
        </div>
        <div className="text-white/50 text-xs mt-4">Usuário logado: {session?.user?.email}</div>
      </section>
      <footer className="w-full text-white/40 text-sm text-center pt-8 animate-fade-in delay-300">
        Dúvidas? Consulte a <a href="/documentacao" className="underline hover:text-[#7F9FFF]">documentação</a> ou entre em contato com o suporte.<br />
        <span className="text-white/30">© {new Date().getFullYear()} JohnTech. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}
