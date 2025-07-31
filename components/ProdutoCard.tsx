import { Produto } from "@/types/produto";
import { FaBoxOpen } from "react-icons/fa6";

interface ProdutoCardProps {
  produto: Produto;
}

export default function ProdutoCard({ produto }: ProdutoCardProps) {
  return (
    <div className="bg-white/10 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-fuchsia-500/30">
      {produto.imagem ? (
        <img src={produto.imagem} alt={produto.nome} className="mb-2 rounded-lg max-h-24 object-contain border border-fuchsia-400" />
      ) : (
        <FaBoxOpen className="text-blue-400 text-4xl mb-2" />
      )}
      <span className="text-lg font-bold text-white/90 mb-1 text-center">{produto.nome}</span>
      <span className="text-xs text-white/60 mb-2">SKU: {produto.sku}</span>
      <span className="text-fuchsia-300 font-bold text-xl mb-1">R$ {produto.preco.toFixed(2)}</span>
      <span className="text-emerald-400 text-sm">Estoque: {produto.estoque}</span>
    </div>
  );
}
