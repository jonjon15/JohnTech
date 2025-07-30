"use client"

import { signIn } from "next-auth/react"


export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#09091a]">
      <main className="relative z-10 pt-28 pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-start min-h-screen transition-all duration-500">
        <div className="w-full flex-1 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-8 md:p-12 transition-all duration-500 flex flex-col items-center max-w-md mx-auto animate-fade-in mt-8">
          <div className="flex flex-col items-center mb-6">
            <img src="/placeholder-logo.svg" alt="Logo JohnTech" className="w-16 h-16 mb-2 drop-shadow-xl animate-fade-in" />
            <span className="text-xs text-white/50 tracking-widest uppercase font-bold drop-shadow">JohnTech</span>
          </div>
          {/* Card de boas-vindas */}
          <div className="mb-6 w-full text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#7F9FFF] via-white to-[#7F5AF0] bg-clip-text text-transparent drop-shadow">Bem-vindo à plataforma <span className="text-[#7F5AF0]">JohnTech</span></h1>
            <p className="text-white/80 text-base md:text-lg">Faça login para acessar todos os recursos premium de gestão.</p>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7F9FFF] to-[#7F5AF0] text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-2xl hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F5AF0]/60 focus:ring-offset-2 active:scale-95 group"
            onClick={() => signIn("google")}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <svg width="26" height="26" viewBox="0 0 48 48" className="inline-block drop-shadow-lg"><g><circle fill="#fff" cx="24" cy="24" r="24"/><path fill="#4285F4" d="M34.6 24.2c0-.7-.1-1.4-.2-2H24v4.1h6c-.3 1.5-1.3 2.7-2.7 3.5v2.9h4.4c2.6-2.4 4.1-5.9 4.1-10.5z"/><path fill="#34A853" d="M24 36c3.6 0 6.6-1.2 8.8-3.2l-4.4-2.9c-1.2.8-2.7 1.3-4.4 1.3-3.4 0-6.2-2.3-7.2-5.3h-4.5v3.1C15.2 33.8 19.3 36 24 36z"/><path fill="#FBBC05" d="M16.8 25.9c-.3-.8-.5-1.7-.5-2.7s.2-1.9.5-2.7v-3.1h-4.5C11.5 19.8 11 21.8 11 24s.5 4.2 1.3 6.1l4.5-3.2z"/><path fill="#EA4335" d="M24 17.7c2 0 3.7.7 5.1 2l3.8-3.8C30.6 13.9 27.6 12.5 24 12.5c-4.7 0-8.8 2.2-11.2 5.7l4.5 3.2c1-3 3.8-5.3 7.2-5.3z"/></g></svg>
              Entrar com Google
            </span>
          </button>
          <div className="mt-8 text-xs text-white/60 text-center select-none animate-fade-in delay-200">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-[#7F5AF0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z"/></svg>
              Seus dados estão protegidos com autenticação Google OAuth 2.0
            </span>
          </div>
        </div>
      </main>
      <footer className="w-full text-center text-xs text-white/40 mt-8 mb-2 animate-fade-in">
        <span>© {new Date().getFullYear()} JohnTech. <a href="/documentacao" className="underline hover:text-[#7F9FFF]">Documentação</a> | <a href="mailto:suporte@johntech.com" className="underline hover:text-[#7F9FFF]">Suporte</a></span>
      </footer>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both;
        }
      `}</style>
    </div>
  )
}
