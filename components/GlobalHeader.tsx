"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Painel" },
  { href: "/produtos", label: "Produtos" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/planos", label: "Planos" },
  { href: "/documentacao", label: "Documentação" },
  { href: "/auth/signin", label: "Entrar" },
];

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const filteredLinks = session?.user ? navLinks.filter(l => l.href !== "/auth/signin") : navLinks;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#232946] via-[#3a3a6a] to-[#7F5AF0] backdrop-blur-xl shadow-lg transition-colors duration-500">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3 md:py-4 relative">
        {/* Logo */}
        <div className="flex items-center gap-3 md:gap-6 select-none">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-sm">John</span>
              <span className="text-3xl md:text-4xl font-extrabold text-[#A78BFA] drop-shadow-sm">Tech</span>
            </span>
          </Link>
        </div>
        {/* Navegação desktop centralizada */}
        <div className="flex-1 flex justify-center">
          <ul className="hidden md:flex gap-7 md:gap-10 text-base md:text-lg font-semibold text-white/90 items-end">
            {filteredLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative group px-2 py-1 rounded transition-colors duration-200 hover:text-[#7F9FFF]`}
                >
                  <span className="font-medium tracking-wide">{link.label}</span>
                  <span
                    className="pointer-events-none absolute left-1/2 bottom-0 h-[2px] w-0 rounded-full transition-all duration-700 bg-[linear-gradient(90deg,rgba(127,159,255,0)_0%,#7F9FFF_15%,#A78BFA_50%,#7F5AF0_85%,rgba(127,90,240,0)_100%)] group-hover:w-full group-hover:-translate-x-1/2 group-hover:opacity-100 opacity-0 blur-[0.5px] shadow-[0_2px_8px_0_rgba(127,90,240,0.12)] after:content-[''] after:absolute after:left-0 after:top-0 after:w-full after:h-full after:rounded-full after:opacity-0 group-hover:after:opacity-100 after:transition-all after:duration-700 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.25)_20%,rgba(255,255,255,0.18)_80%,rgba(255,255,255,0)_100%)]"
                  ></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Usuário logado ou botão Entrar (desktop) */}
        <div className="hidden md:flex items-center gap-4 min-w-[120px] justify-end">
          {session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.image && (
                <img src={session.user.image} alt={session.user.name || session.user.email || "Usuário"} className="w-8 h-8 rounded-full border-2 border-[#7F9FFF] shadow" />
              )}
              <span className="font-bold text-white/90 text-base max-w-[120px] truncate">{session.user.name || session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 px-3 py-1 rounded bg-[#7F5AF0] hover:bg-[#7F9FFF] text-white font-bold text-sm shadow transition-all"
              >Sair</button>
            </div>
          ) : (
            <Link href="/auth/signin" className="px-4 py-1.5 rounded bg-[#7F5AF0] hover:bg-[#7F9FFF] text-white font-bold text-base shadow transition-all">
              Entrar
            </Link>
          )}
        </div>
        {/* Botão menu mobile */}
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
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-4xl font-extrabold text-white/90 hover:text-[#7F9FFF] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Usuário logado no menu mobile */}
            {session?.user && (
              <div className="flex flex-col items-center gap-2 mt-8">
                {session.user.image && (
                  <img src={session.user.image} alt={session.user.name || session.user.email || "Usuário"} className="w-16 h-16 rounded-full border-2 border-[#7F9FFF] shadow" />
                )}
                <span className="font-bold text-lg text-white/90">{session.user.name || session.user.email}</span>
                {session.user.email && <span className="text-white/60 text-sm">{session.user.email}</span>}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="mt-2 px-4 py-2 rounded bg-[#7F5AF0] hover:bg-[#7F9FFF] text-white font-bold text-base shadow transition-all"
                >Sair</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}