
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import Providers from "./providers";
import CustomCursor from "../components/CustomCursor";
import GlobalHeader from "@/components/GlobalHeader";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JohnTech - Premium Inventory Management",
  description: "Advanced inventory management with Bling ERP integration",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " bg-[#09091a] text-white antialiased transition-colors duration-500 min-h-screen"}>
        <Providers>
          {/* Fundo animado premium com gradientes e partículas */}
          <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#09091a]">
            {/* Gradiente animado de fundo */}
            <div className="pointer-events-none absolute inset-0 z-0">
              <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-blue-700 via-fuchsia-600 to-transparent opacity-40 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-fuchsia-500 via-blue-400 to-transparent opacity-30 rounded-full blur-2xl animate-pulse-slower" />
              <div className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-[#7F5AF0]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" />
            </div>
            <CustomCursor />
            <GlobalHeader />
            <main className="relative z-10 pt-28 pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-start min-h-screen transition-all duration-500">
              <div className="w-full flex-1 rounded-2xl shadow-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-8 md:p-12 transition-all duration-500">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}