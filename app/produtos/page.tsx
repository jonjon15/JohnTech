"use client";
import { useSession } from "next-auth/react";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import ProdutoModal from "@/components/ProdutoModal";
import ProdutoCard from "@/components/ProdutoCard";
import { useGooglePicker } from "@/hooks/useGooglePicker";
import { Produto } from "@/types/produto";

export default function ProdutosPage() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  // Carrega produtos reais do backend ao montar
  useEffect(() => {
    fetch("/api/bling/produtos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.produtos)) {
          setProdutos(data.produtos);
        }
      })
      .catch(() => {
        // Em caso de erro, mantém vazio
      });
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: "", sku: "", preco: "", estoque: "", imagem: "" });
  const [erro, setErro] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const { openPicker } = useGooglePicker();

  const handleOpenModal = () => {
    setForm({ nome: "", sku: "", preco: "", estoque: "", imagem: "" });
    setPreview(null);
    setErro("");
    setEditIndex(null);
    setShowModal(true);
  };
  const handleEditProduto = (produto: Produto) => {
    setForm({
      nome: produto.nome,
      sku: produto.sku,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      imagem: produto.imagem || ""
    });
    setPreview(produto.imagem || null);
    setErro("");
    setEditIndex(produtos.findIndex(p => p.sku === produto.sku));
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleGoogleDrivePicker = () => {
    openPicker((url) => setForm((prev) => ({ ...prev, imagem: url })));
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nome || !form.sku || !form.preco || !form.estoque) {
      setErro("Preencha todos os campos.");
      return;
    }
    const novoProduto: Produto = {
      nome: form.nome,
      sku: form.sku,
      preco: parseFloat(form.preco),
      estoque: parseInt(form.estoque),
      imagem: form.imagem,
    };
    if (editIndex !== null && editIndex >= 0) {
      // Edição
      try {
        const res = await fetch("/api/bling/produtos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoProduto),
        });
        if (!res.ok) {
          const err = await res.json();
          setErro(err.error || "Erro ao editar produto.");
          return;
        }
        const atualizados = [...produtos];
        atualizados[editIndex] = novoProduto;
        setProdutos(atualizados);
      } catch {
        setErro("Erro de rede ao editar produto.");
        return;
      }
    } else {
      // Cadastro novo
      try {
        const res = await fetch("/api/bling/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoProduto),
        });
        if (!res.ok) {
          const err = await res.json();
          setErro(err.error || "Erro ao cadastrar produto.");
          return;
        }
        setProdutos([...produtos, novoProduto]);
      } catch {
        setErro("Erro de rede ao cadastrar produto.");
        return;
      }
    }
    setShowModal(false);
    setEditIndex(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in px-2">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg mb-6 text-center">
        Produtos
      </h1>

      {/* Barra de busca e botão adicionar */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div className="flex items-center w-full md:w-auto bg-white/10 rounded-lg px-3 py-2 border border-white/10">
          <FaMagnifyingGlass className="text-white/40 mr-2" />
          <input
            type="text"
            placeholder="Buscar produto... (visual)"
            className="bg-transparent outline-none text-white/80 w-full md:w-64 placeholder:text-white/40"
            disabled
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-700 via-fuchsia-600 to-blue-400 text-white font-bold shadow hover:scale-105 hover:shadow-fuchsia-500/40 transition-all duration-200"
          onClick={handleOpenModal}
        >
          <FaPlus /> Adicionar Produto
        </button>
      </div>

      {/* Modal de cadastro de produto */}
      <ProdutoModal
        open={showModal}
        form={form}
        erro={erro}
        preview={preview}
        onChange={handleChange}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onGoogleDrive={handleGoogleDrivePicker}
      />

      {/* Cards de produtos */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {produtos.map((p) => (
          <ProdutoCard key={p.sku} produto={p} onEdit={handleEditProduto} />
        ))}
        {produtos.length === 0 && (
          <div className="col-span-full text-center text-white/60 py-8">Nenhum produto cadastrado.</div>
        )}
      </section>

      <section className="w-full max-w-2xl bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-500 text-white/90">
        <p className="text-lg md:text-xl mb-6">Adicione, edite e visualize seus produtos cadastrados de forma simples, moderna e <span className="font-bold text-[#7F9FFF]">premium</span>.</p>
        <div className="text-white/50 text-xs mt-4">Usuário logado: {session?.user?.email}</div>
      </section>

      <footer className="w-full text-white/40 text-sm text-center pt-8 animate-fade-in delay-300">
        Dúvidas? Consulte a <a href="/documentacao" className="underline hover:text-[#7F9FFF]">documentação</a> ou entre em contato com o suporte.<br />
        <span className="text-white/30">© {new Date().getFullYear()} JohnTech. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}

