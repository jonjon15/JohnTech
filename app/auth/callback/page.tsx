"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const error = searchParams.get("error")
        const state = searchParams.get("state")

        console.log("🔄 Processando callback:", { code: !!code, error, state })

        if (error) {
          throw new Error(`Erro OAuth: ${error}`)
        }

        if (!code) {
          throw new Error("Código de autorização não encontrado")
        }

        console.log("📡 Enviando código para o servidor...")

        const response = await fetch("/api/auth/bling/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        })

        const data = await response.json()

        console.log("📊 Resposta do servidor:", data)

        if (response.ok) {
          setStatus("success")
          setMessage("Autenticação realizada com sucesso!")
          setDetails(data)

          // Redirecionar após 3 segundos
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          throw new Error(data.error || `Erro ${response.status}`)
        }
      } catch (error: any) {
        console.error("❌ Erro no callback:", error)
        setStatus("error")
        setMessage(error.message)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-400" />}
            {status === "error" && <XCircle className="h-6 w-6 text-red-400" />}
            Processando Autenticação
          </CardTitle>
          <CardDescription className="text-white/70">
            {status === "loading" && "Validando credenciais com o Bling..."}
            {status === "success" && "Redirecionando para o dashboard..."}
            {status === "error" && "Ocorreu um erro na autenticação"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="text-center text-white/70">
              <div className="animate-pulse">Aguarde...</div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <Alert className="bg-green-600/20 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">{message}</AlertDescription>
              </Alert>

              {details && (
                <div className="text-sm text-white/70 space-y-1">
                  <p>✅ Token de acesso obtido</p>
                  <p>✅ Token de refresh salvo</p>
                  <p>✅ Configuração concluída</p>
                </div>
              )}

              <Button onClick={() => router.push("/dashboard")} className="w-full bg-green-600 hover:bg-green-700">
                Ir para Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert className="bg-red-600/20 border-red-500/30">
                <XCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{message}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button onClick={() => router.push("/configuracao-bling")} className="w-full" variant="outline">
                  Tentar Novamente
                </Button>
                <Button onClick={() => router.push("/")} variant="ghost" className="w-full text-white/70">
                  Voltar ao Início
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
