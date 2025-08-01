import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EmailAuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    // Login via NextAuth credenciais
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password: senha,
    });
    setLoading(false);
    if (res?.ok) {
      onClose();
      router.push("/dashboard");
    } else {
      setErro("E-mail ou senha inválidos");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          title="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-[#7F5AF0]">Entrar ou cadastrar com e-mail</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7F5AF0]/40"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Senha"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7F5AF0]/40"
            required
            value={senha}
            onChange={e => setSenha(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-[#7F5AF0] to-[#7F9FFF] text-white font-bold text-lg shadow hover:scale-105 transition-all" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {erro && <div className="text-red-500 text-sm text-center mt-2">{erro}</div>}
        <div className="mt-4 text-center text-xs text-gray-500">
          <span>Não tem conta? <a href="#" className="text-[#7F5AF0] underline">Cadastre-se</a></span>
        </div>
      </div>
    </div>
  );
}
