import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import MainHeader from "@/components/main-header" // Corrigido para importação padrão
import { FlyingParticles } from "@/components/flying-particles" // Importa o novo componente

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BlingPro - Premium Inventory Management",
  description: "Advanced inventory management with Bling ERP integration",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <MainHeader />
          {/* Adiciona um contêiner relativo para as partículas e o conteúdo */}
          <div className="relative min-h-screen">
            <FlyingParticles /> {/* Coloca as partículas aqui */}
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
