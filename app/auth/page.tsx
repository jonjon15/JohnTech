"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Check } from "lucide-react"
import { useTheme } from "@/contexts/theme-context" // Corrigido

export default function AuthPage() {
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"
  const [isConnecting, setIsConnecting] = useState(false)

  const handleBlingAuth = async () => {
    setIsConnecting(true)

    try {
      const clientId = "44866dbd8fe131077d73dbe3d60531016512c855"

      // Use crypto.randomUUID() para um state mais robusto e único
      const state = crypto.randomUUID()
      // Use sempre https://johntech.vercel.app/auth/callback para produção.
      // Altere conforme necessário para deploy.
      const redirectUri = encodeURIComponent("https://johntech.vercel.app/auth/callback")

      // Armazene o state no localStorage ANTES de redirecionar
      localStorage.setItem("bling_oauth_state", state)
      console.log("AuthPage: Storing state in localStorage:", state)

      const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`

      console.log("AuthPage: Redirecting to Bling with URL:", authUrl)

      window.location.href = authUrl
    } catch (error) {
      console.error("AuthPage: Error during Bling authentication initiation:", error)
      setIsConnecting(false)
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"}`}
    >
      <div className="w-full max-w-md">
        <Card
          className={`w-full max-w-md backdrop-blur-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
        >
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl ${isWakanda ? "text-green-100" : "text-white"}`}>
              Conectar ao Bling
            </CardTitle>
            <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
              Conecte sua conta Bling ERP de forma segura para gerenciar seu estoque
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                "Autenticação OAuth2 segura",
                "Sincronização de estoque em tempo real",
                "Gestão completa de produtos",
                "Notificações via webhook",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className={`h-4 w-4 ${isWakanda ? "text-green-400" : "text-green-400"}`} />
                  <span className={`${isWakanda ? "text-green-100/80" : "text-white/80"} text-sm`}>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleBlingAuth}
              disabled={isConnecting}
              className={`w-full py-3 ${isWakanda ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-black font-semibold wakanda-glow" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"}`}
            >
              {isConnecting ? (
                <>
                  <div
                    className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${isWakanda ? "border-green-400" : "border-white"}`}
                  ></div>
                  Conectando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Conectar com Bling
                </>
              )}
            </Button>

            <div className="flex items-center justify-center space-x-4 text-xs text-white/50">
              <div className="flex items-center space-x-1">
                <Shield className={`h-3 w-3 ${isWakanda ? "text-green-100/50" : "text-white/50"}`} />
                <span>Seguro</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className={`h-3 w-3 ${isWakanda ? "text-green-100/50" : "text-white/50"}`} />
                <span>Rápido</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Badge
            className={`${isWakanda ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-blue-600/20 text-blue-300 border-blue-500/30"}`}
          >
            Powered by Bling API v3
          </Badge>
        </div>
      </div>
    </div>
  )
}
