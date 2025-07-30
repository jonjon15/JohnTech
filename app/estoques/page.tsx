import React from "react";

export default function EstoquesPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg mb-6 text-center">Estoques</h1>
      <section className="w-full max-w-2xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90">
        <p className="text-lg md:text-xl mb-6">Consulta e atualização de estoques integrados ao <span className="font-bold text-[#7F9FFF]">Bling</span>.</p>
        {/* TODO: Implementar consulta e atualização de estoques via API Bling */}
      </section>
    </div>
  );
}
