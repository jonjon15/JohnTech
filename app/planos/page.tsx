
import React from "react";
import { CheckCircle2, Star, ShieldCheck, Gift } from "lucide-react";

const planos = [
  {
    nome: "Starter",
    preco: "Grátis ou Baixo Custo",
    descricao: "Para quem está começando e quer integração básica com Bling.",
    recursos: [
      "Integração básica com Bling (produtos, pedidos)",
      "Até 100 produtos sincronizados",
      "1 usuário",
      "Webhooks e logs básicos",
      "Suporte por e-mail (SLA 48h)"
    ],
    destaque: false,
    trial: false,
  },
  {
    nome: "Pro",
    preco: "R$ 49/mês",
    descricao: "Para negócios em crescimento que precisam de mais recursos.",
    recursos: [
      "Tudo do Starter",
      "Estoque avançado e múltiplos depósitos",
      "Até 5.000 produtos/pedidos",
      "3 usuários",
      "Relatórios e dashboard completos",
      "Webhooks ilimitados",
      "Suporte por e-mail (SLA 24h)"
    ],
    destaque: true,
    trial: true,
  },
  {
    nome: "Business",
    preco: "R$ 149/mês",
    descricao: "Para operações maiores e times que precisam de escala.",
    recursos: [
      "Tudo do Pro",
      "Produtos, pedidos e estoques ilimitados",
      "10 usuários",
      "Permissões e auditoria avançada",
      "Integração com outros ERPs/marketplaces (futuro)",
      "Suporte prioritário (SLA 8h)",
      "Onboarding assistido"
    ],
    destaque: false,
    trial: true,
  },
  {
    nome: "Enterprise",
    preco: "Sob consulta",
    descricao: "Para grandes empresas e integrações customizadas.",
    recursos: [
      "Recursos ilimitados",
      "Usuários ilimitados",
      "SLA e integrações customizadas",
      "Suporte dedicado (SLA 2h)",
      "Consultoria e integrações sob demanda"
    ],
    destaque: false,
    trial: true,
  }
];
  
export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      {/* Banner de promoção */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-orange-400 text-white rounded-xl py-4 px-6 shadow-lg animate-fade-in">
          <Gift className="w-7 h-7" />
          <span className="font-bold text-lg">Promoção de Lançamento:</span>
          <span className="font-medium">Assine qualquer plano pago e ganhe <b>14 dias de trial grátis</b>!</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Star className="w-8 h-8 text-yellow-400" /> Planos e Ofertas
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Escolha o plano ideal para o seu negócio. Flexibilidade, segurança e integração total com o Bling.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`relative rounded-2xl shadow-xl p-8 bg-white dark:bg-gray-900 border-2 transition-all flex flex-col items-center ${
              plano.destaque
                ? "border-orange-400 scale-105 z-10 ring-4 ring-orange-100 dark:ring-orange-900"
                : "border-gray-200 dark:border-gray-800"
            }`}
          >
            {plano.destaque && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white px-4 py-1 rounded-full font-bold shadow-lg flex items-center gap-1 text-sm animate-bounce">
                <Star className="w-4 h-4" /> RECOMENDADO
              </span>
            )}
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {plano.nome}
              {plano.trial && (
                <span className="ml-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">14 dias trial</span>
              )}
            </h2>
            <div className={`text-3xl font-extrabold mb-2 ${plano.destaque ? "text-orange-500" : "text-blue-600"}`}>{plano.preco}</div>
            <p className="mb-4 text-gray-600 dark:text-gray-300 text-sm min-h-[48px]">{plano.descricao}</p>
            <ul className="text-left mb-6 space-y-2 w-full">
              {plano.recursos.map((r) => (
                <li key={r} className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${
                plano.destaque
                  ? "bg-orange-500 text-white hover:bg-orange-600 animate-pulse"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
              disabled={plano.preco === "Sob consulta"}
            >
              {plano.preco === "Sob consulta" ? "Fale com vendas" : "Assinar agora"}
            </button>
            {plano.nome === "Starter" && (
              <span className="mt-3 text-emerald-600 font-bold text-xs">Ideal para começar sem custo!</span>
            )}
            {plano.nome === "Business" && (
              <span className="mt-3 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-semibold">Para times que precisam de escala</span>
            )}
            {plano.nome === "Enterprise" && (
              <span className="mt-3 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold">Solução sob medida para grandes operações</span>
            )}
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto mt-12 text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-emerald-600 font-semibold">
          <ShieldCheck className="w-5 h-5" />
          Todos os planos incluem criptografia, logs, rastreabilidade e segurança de nível empresarial.
        </div>
        <div className="flex items-center gap-2 text-orange-500 font-semibold">
          <Gift className="w-5 h-5" />
          Trial de 14 dias disponível para planos pagos.
        </div>
      </div>
    </main>
  );
}
