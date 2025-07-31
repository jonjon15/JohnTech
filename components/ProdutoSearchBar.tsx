import { ChangeEvent } from "react";

interface ProdutoSearchBarProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function ProdutoSearchBar({ value, onChange }: ProdutoSearchBarProps) {
  return (
    <div className="flex items-center w-full md:w-auto bg-white/10 rounded-lg px-3 py-2 border border-white/10">
      {/* Ícone de busca pode ser adicionado aqui se necessário */}
      <input
        type="text"
        placeholder="Buscar produto... (visual)"
        className="bg-transparent outline-none text-white/80 w-full md:w-64 placeholder:text-white/40"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
