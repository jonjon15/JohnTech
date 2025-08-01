import React from "react";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import ProdutoCard from "@/components/ProdutoCard";
import ProdutoModal from "@/components/ProdutoModal";
// ...outros imports necessários...
// ...outros imports necessários...
import React from "react";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import ProdutoCard from "@/components/ProdutoCard";
import ProdutoModal from "@/components/ProdutoModal";
// ...outros imports necessários...
import React from "react";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import ProdutoCard from "@/components/ProdutoCard";
import ProdutoModal from "@/components/ProdutoModal";
// ...outros imports necessários...
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<number | null>(null);
  const [produtosFornecedor, setProdutosFornecedor] = useState<Produto[]>([]);
  // Carrega produtos reais do backend ao montar
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/bling/produtos", {
      headers: { "x-user-email": session.user.email }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.produtos)) {
          setProdutos(data.produtos);
        }
      })
      .catch(() => {
        // Em caso de erro, mantém vazio
      });
    // Carrega fornecedores do backend
    fetch("/api/bling/fornecedores", {
      headers: { "x-user-email": session.user.email }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.fornecedores)) {
          setFornecedores(data.fornecedores);
        }
      })

import React from "react";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import ProdutoCard from "@/components/ProdutoCard";
import ProdutoModal from "@/components/ProdutoModal";
// ...outros imports necessários...


export default function ProdutosPage() {
  // Stubs para variáveis e funções usadas no JSX
  const fornecedores = [];
  const fornecedorSelecionado = null;
  const produtosFornecedor = [];
  const produtos = [];
  const showModal = false;
  const form = {};
  const erro = null;
  const preview = null;
  const session = { user: { email: "" } };

  function handleFornecedorChange() {}
  function handleOpenModal() {}
  function handleChange() {}
  function handleCloseModal() {}
  function handleSubmit() {}
  function handleGoogleDrivePicker() {}
  function handleEditProduto() {}

  return (
    <div>
      <div className="w-full flex flex-col items-center justify-center gap-8 animate-fade-in px-2">
        {/* Filtro de fornecedores */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <label className="block mb-2 text-lg font-bold text-white">Escolha o fornecedor:</label>
          <select
            className="w-full p-2 rounded-lg border border-gray-300 mb-2"
            value={fornecedorSelecionado ?? ""}
            onChange={handleFornecedorChange}
          >
            <option value="">Selecione...</option>
            {fornecedores.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>

        {/* Lista de produtos do fornecedor selecionado */}
        {fornecedorSelecionado && (
          <div className="w-full max-w-3xl mx-auto bg-white/10 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Produtos do fornecedor</h2>
            <ul className="space-y-4">
              {produtosFornecedor.map(prod => (
                <li key={prod.sku} className="bg-white/20 rounded-lg p-4 flex flex-col gap-2">
                  <span className="font-bold text-[#7F5AF0]">{prod.nome}</span>
                  <span className="text-xs text-white/80">SKU: {prod.sku}</span>
                  <span className="text-xs text-white/80">Preço: R$ {prod.preco}</span>
                  <span className="text-xs text-white/80">Estoque: {prod.estoque}</span>
                  {/* Adicione outros campos do padrão Bling se necessário */}
                </li>
              ))}
            </ul>
            <button
              className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#7F9FFF] text-white font-bold shadow hover:scale-105 transition-all"
              onClick={async () => {
                if (!session?.user?.email) return;
                try {
                  const res = await fetch("/api/bling/produtos/importar", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-user-email": session.user.email
                    },
                    body: JSON.stringify({ produtos: produtosFornecedor })
                  });
                  if (res.ok) {
                    alert("Produtos importados com sucesso!");
                  } else {
                    const err = await res.json();
                    alert(err.error || "Erro ao importar produtos.");
                  }
                } catch {
                  alert("Erro de rede ao importar produtos.");
                }
              }}
            >
              Importar produtos
            </button>
          </div>
        )}

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
    </div>
  );
}
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow-lg mb-6 text-center">
        Produtos
      </h1>
  
      {/* Filtro de fornecedores */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <label className="block mb-2 text-lg font-bold text-white">Escolha o fornecedor:</label>
        <select
          className="w-full p-2 rounded-lg border border-gray-300 mb-2"
          value={fornecedorSelecionado ?? ""}
          onChange={handleFornecedorChange}
        >
          <option value="">Selecione...</option>
          {fornecedores.map(f => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>
      </div>
  
      {/* Lista de produtos do fornecedor selecionado */}
      {fornecedorSelecionado && (
        <div className="w-full max-w-3xl mx-auto bg-white/10 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Produtos do fornecedor</h2>
          <ul className="space-y-4">
            {produtosFornecedor.map(prod => (
              <li key={prod.sku} className="bg-white/20 rounded-lg p-4 flex flex-col gap-2">
                <span className="font-bold text-[#7F5AF0]">{prod.nome}</span>
                <span className="text-xs text-white/80">SKU: {prod.sku}</span>
                <span className="text-xs text-white/80">Preço: R$ {prod.preco}</span>
                <span className="text-xs text-white/80">Estoque: {prod.estoque}</span>
                {/* Adicione outros campos do padrão Bling se necessário */}
              </li>
            ))}
          </ul>
          <button
            className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#7F9FFF] text-white font-bold shadow hover:scale-105 transition-all"
            onClick={async () => {
              if (!session?.user?.email) return;
              try {
                const res = await fetch("/api/bling/produtos/importar", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-user-email": session.user.email
                  },
                  body: JSON.stringify({ produtos: produtosFornecedor })
                });
                if (res.ok) {
                  alert("Produtos importados com sucesso!");
                } else {
                  const err = await res.json();
                  alert(err.error || "Erro ao importar produtos.");
                }
              } catch {
                alert("Erro de rede ao importar produtos.");
              }
            }}
          >
            Importar produtos
          </button>
        </div>
      )}
  
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

