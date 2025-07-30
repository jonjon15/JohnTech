"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Navegação principal premium
const navLinks = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Painel" },
  { href: "/produtos", label: "Produtos" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/planos", label: "Planos" },
  { href: "/documentacao", label: "Documentação" },
  { href: "/auth/signin", label: "Entrar" },
];

// Cabeçalho global premium, limpo e moderno
import { usePathname } from "next/navigation";

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#232946] via-[#3a3a6a] to-[#7F5AF0] backdrop-blur-xl shadow-lg transition-colors duration-500">
      <nav className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-2">
        {/* Logo com gradiente animado premium */}
        <div className="flex items-center select-none mb-2 md:mb-0">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent animate-gradient-x rounded-md drop-shadow-lg">JohnTech</span>
        </div>
        {/* Navegação desktop premium centralizada */}
        <ul className="hidden md:flex gap-7 md:gap-10 text-base md:text-lg font-semibold text-white/90">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={`relative group px-2 py-1 rounded transition-colors duration-200 hover:text-[#7F9FFF] ${pathname === link.href ? "text-[#7F9FFF] font-bold" : ""}`}>
                <span className="font-medium tracking-wide">{link.label}</span>
                <span className={`absolute left-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#7F9FFF] to-[#7F5AF0] rounded-full transition-all duration-300 ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"}`}></span>
              </Link>
            </li>
          ))}
        </ul>
        {/* Botão menu mobile premium */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded bg-white/10 hover:bg-[#7F9FFF]/10 transition"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <span className={`block h-0.5 w-6 bg-[#7F9FFF] rounded transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`block h-0.5 w-6 bg-[#7F9FFF] rounded transition-all ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block h-0.5 w-6 bg-[#7F9FFF] rounded transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </nav>
      {/* Menu mobile premium, limpo e animado */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-[#232946]/95 via-[#3a3a6a]/95 to-[#7F5AF0]/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-4xl font-extrabold text-white/90 hover:text-[#7F9FFF] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
