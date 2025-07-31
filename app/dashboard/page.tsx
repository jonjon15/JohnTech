
"use client";


import { FaBoxOpen, FaClipboardList, FaBookOpen, FaBell, FaPlus } from "react-icons/fa6";

const mockResumo = [
  { label: "Produtos", value: 128, icon: <FaBoxOpen className="text-blue-400 text-3xl" />, href: "/produtos" },
  { label: "Pedidos", value: 42, icon: <FaClipboardList className="text-fuchsia-400 text-3xl" />, href: "/pedidos" },
  { label: "Documentação", value: "Atualizada", icon: <FaBookOpen className="text-emerald-400 text-3xl" />, href: "/documentacao" },
];

// Mock para gráfico de barras
const mockStats = [
  { label: "Jan", value: 10 },
  { label: "Fev", value: 22 },
  { label: "Mar", value: 18 },
  { label: "Abr", value: 30 },
  { label: "Mai", value: 25 },
  { label: "Jun", value: 40 },
];

const novidades = [
  {
    title: "Nova integração disponível!",
    desc: "Agora você pode integrar com o Bling Premium.",
    date: "30/07/2025",
  },
  {
    title: "Melhorias de performance",
    desc: "O painel está mais rápido e responsivo.",
    date: "28/07/2025",
  },
];



export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in px-2">

      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg text-center md:text-left">
          Dashboard
        </h1>
        <a href="/produtos" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">
          <FaPlus /> Novo Produto
        </a>
      </div>


      {/* Resumo visual */}
      <section className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-4">
        {mockResumo.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group bg-gradient-to-br from-[#232946] to-[#7F5AF0]/10 rounded-2xl shadow-xl p-7 flex flex-col items-center border border-[#7F5AF0]/30 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-fuchsia-500/30 cursor-pointer"
          >
            <div className="mb-2">{item.icon}</div>
            <span className="text-3xl font-bold text-white/90 group-hover:text-fuchsia-400 transition">{item.value}</span>
            <span className="text-lg font-semibold text-[#7F9FFF] mt-1">{item.label}</span>
          </a>
        ))}
      </section>

      {/* Gráfico de barras mockado */}
      <section className="w-full max-w-3xl bg-white/10 rounded-2xl shadow-xl p-6 mb-4 border border-fuchsia-700/20 flex flex-col gap-3 items-center">
        <h2 className="text-lg font-bold text-white/90 mb-2 text-center w-full">Movimentação de Pedidos (mock)</h2>
        <div className="flex items-end justify-center gap-6 h-40 w-full">
          {mockStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center w-14">
              <div
                className={`bar bg-gradient-to-t from-fuchsia-600 to-blue-400 rounded-t-lg shadow-md transition-all duration-300 w-8 h-[${stat.value * 3}px]`}
                title={`Pedidos: ${stat.value}`}
              ></div>
              <span className="text-xs text-white/70 mt-1">{stat.label}</span>
              <span className="text-xs text-fuchsia-200">{stat.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Novidades/Alertas */}
      <section className="w-full max-w-3xl bg-gradient-to-br from-fuchsia-900/40 to-blue-900/30 rounded-2xl shadow-xl p-6 mb-4 border border-fuchsia-700/30 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <FaBell className="text-yellow-400 text-xl" />
          <h2 className="text-xl font-bold text-white/90">Novidades</h2>
        </div>
        <ul className="space-y-2">
          {novidades.map((n) => (
            <li key={n.title} className="bg-white/5 rounded-lg px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-semibold text-fuchsia-300">{n.title}</span>
                <span className="block text-white/80 text-sm">{n.desc}</span>
              </div>
              <span className="text-xs text-neutral-400 mt-1 md:mt-0">{n.date}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cards de navegação detalhados */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-gradient-to-br from-[#232946] to-[#7F5AF0]/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-[#7F5AF0]/30 backdrop-blur-md transition-all duration-500 hover:scale-105">
          <h3 className="text-xl font-bold mb-2 text-[#7F9FFF]">Produtos</h3>
          <p className="text-white/80 mb-2 text-center">Gerencie e monitore todos os produtos integrados ao JohnTech.</p>
          <a href="/produtos" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">Ver Produtos</a>
        </div>
        <div className="bg-gradient-to-br from-[#232946] to-[#7F5AF0]/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-[#7F5AF0]/30 backdrop-blur-md transition-all duration-500 hover:scale-105">
          <h3 className="text-xl font-bold mb-2 text-[#7F9FFF]">Pedidos</h3>
          <p className="text-white/80 mb-2 text-center">Acompanhe e gerencie seus pedidos de venda.</p>
          <a href="/pedidos" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">Ver Pedidos</a>
        </div>
        <div className="bg-gradient-to-br from-[#232946] to-[#7F5AF0]/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-[#7F5AF0]/30 backdrop-blur-md transition-all duration-500 hover:scale-105">
          <h3 className="text-xl font-bold mb-2 text-[#7F9FFF]">Documentação</h3>
          <p className="text-white/80 mb-2 text-center">Consulte a documentação e checklist de integração.</p>
          <a href="/documentacao" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200">Ver Documentação</a>
        </div>
      </section>

      {/* Guia de uso */}
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
