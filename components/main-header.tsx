"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/contexts/theme-context"
import { ArrowRight } from "lucide-react"

export function MainHeader() {
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"

  return (
    <nav
      className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${isWakanda ? "bg-black/20 border-green-500/20" : "bg-black/20 border-white/10"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className={`text-2xl font-bold ${isWakanda ? "text-green-400" : "text-white"}`}>
            Bling<span className={isWakanda ? "text-green-300" : "text-purple-400"}>Pro</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition-colors ${isWakanda ? "text-green-200/80 hover:text-green-200" : "text-white/80 hover:text-white"}`}
            >
              Início
            </Link>
            <Link
              href="/dashboard"
              className={`transition-colors ${isWakanda ? "text-green-200/80 hover:text-green-200" : "text-white/80 hover:text-white"}`}
            >
              Painel
            </Link>
            <Link
              href="/homologacao"
              className={`transition-colors ${isWakanda ? "text-green-200/80 hover:text-green-200" : "text-white/80 hover:text-white"}`}
            >
              Homologação
            </Link>
            <Link
              href="/configuracao-bling"
              className={`transition-colors ${isWakanda ? "text-green-200/80 hover:text-green-200" : "text-white/80 hover:text-white"}`}
            >
              Configuração Bling
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth">
              <Button
                className={`${isWakanda ? "bg-green-600 hover:bg-green-700 text-black font-semibold wakanda-glow" : "bg-purple-600 hover:bg-purple-700"} text-white`}
              >
                Começar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MainHeader
