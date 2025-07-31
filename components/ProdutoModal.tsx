import { ChangeEvent, FormEvent } from "react";
import { Produto } from "@/types/produto";

interface ProdutoModalProps {
  open: boolean;
  form: {
    nome: string;
    sku: string;
    preco: string;
    estoque: string;
    imagem: string;
  };
  erro: string;
  preview: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onGoogleDrive: () => void;
}

export default function ProdutoModal({
  open,
  form,
  erro,
  preview,
  onChange,
  onClose,
  onSubmit,
  onGoogleDrive,
}: ProdutoModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#181A20] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-fuchsia-700/30 animate-fade-in flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4">Novo Produto</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            name="nome"
            value={form.nome}
            onChange={onChange}
            placeholder="Nome do produto"
            className="rounded-lg px-4 py-2 bg-white/10 text-white outline-none border border-white/10 focus:border-fuchsia-400"
            autoFocus
          />
          <input
            name="sku"
            value={form.sku}
            onChange={onChange}
            placeholder="SKU"
            className="rounded-lg px-4 py-2 bg-white/10 text-white outline-none border border-white/10 focus:border-fuchsia-400"
          />
          <input
            name="preco"
            value={form.preco}
            onChange={onChange}
            placeholder="Preço"
            type="number"
            step="0.01"
            className="rounded-lg px-4 py-2 bg-white/10 text-white outline-none border border-white/10 focus:border-fuchsia-400"
          />
          <input
            name="estoque"
            value={form.estoque}
            onChange={onChange}
            placeholder="Estoque"
            type="number"
            className="rounded-lg px-4 py-2 bg-white/10 text-white outline-none border border-white/10 focus:border-fuchsia-400"
          />
          <label className="flex flex-col gap-1 text-white/80">
            Imagem do produto
            <div className="flex gap-2">
              <input
                name="imagem"
                type="text"
                value={form.imagem}
                onChange={onChange}
                placeholder="Cole o link da imagem ou use o Drive"
                className="flex-1 rounded-lg px-4 py-2 bg-white/10 text-white outline-none border border-white/10 focus:border-fuchsia-400"
              />
              <button
                type="button"
                onClick={onGoogleDrive}
                className="px-3 py-2 rounded bg-blue-700 hover:bg-fuchsia-600 text-white font-bold"
              >
                Google Drive
              </button>
            </div>
            {form.imagem && (
              <img src={form.imagem} alt="Pré-visualização" className="mt-2 rounded-lg max-h-32 object-contain border border-fuchsia-400" />
            )}
          </label>
          {erro && <div className="text-red-400 text-sm">{erro}</div>}
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition">Cancelar</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold hover:scale-105 transition">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
