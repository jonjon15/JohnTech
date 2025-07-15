"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/contexts/theme-context" // Corrigido

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const stateFromUrl = searchParams.get("state") // Renomeado para clareza
      const errorFromUrl = searchParams.get("error")
      const storedState = localStorage.getItem("bling_oauth_state")

      console.log("CallbackPage: URL params:", {
        code: code,
        stateFromUrl: stateFromUrl,
        errorFromUrl: errorFromUrl,
      })
      console.log("CallbackPage: Stored state from localStorage:", storedState)

      if (errorFromUrl) {
        setStatus("error")
        setMessage(`Authorization was denied or failed: ${errorFromUrl}`)
        console.error("CallbackPage: Authorization error from Bling:", errorFromUrl)
        return
      }

      if (!code) {
        setStatus("error")
        setMessage("Authorization code is missing from the URL.")
        console.error("CallbackPage: Missing authorization code.")
        return
      }

      if (!stateFromUrl || stateFromUrl !== storedState) {
        setStatus("error")
        setMessage("Invalid authorization response: State mismatch or missing.")
        console.error("CallbackPage: State mismatch detected!", {
          stateFromUrl: stateFromUrl,
          storedState: storedState,
        })
        // Limpar o state para evitar reuso de um state inválido
        localStorage.removeItem("bling_oauth_state")
        return
      }

      // Se tudo estiver ok com o state, remover do localStorage
      localStorage.removeItem("bling_oauth_state")
      console.log("CallbackPage: State matched. Proceeding to token exchange.")

      try {
        const response = await fetch("/api/auth/bling/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Successfully connected to Bling!")
          console.log("CallbackPage: Token exchange successful. Redirecting to dashboard.")

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to connect to Bling")
          console.error("CallbackPage: API token exchange failed:", data)
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error occurred during token exchange.")
        console.error("CallbackPage: Network error during token exchange:", error)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${
        isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      }`}
    >
      <Card
        className={`w-full max-w-md backdrop-blur-sm ${
          isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"
        }`}
      >
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl ${isWakanda ? "text-green-100" : "text-white"}`}>
            {status === "loading" && "Conectando..."}
            {status === "success" && "Conectado!"}
            {status === "error" && "Falha na Conexão"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            {status === "loading" && (
              <Loader2 className={`h-16 w-16 animate-spin ${isWakanda ? "text-green-400" : "text-purple-400"}`} />
            )}
            {status === "success" && (
              <CheckCircle className={`h-16 w-16 ${isWakanda ? "text-green-400" : "text-green-400"}`} />
            )}
            {status === "error" && <XCircle className={`h-16 w-16 ${isWakanda ? "text-red-400" : "text-red-400"}`} />}
          </div>

          <p className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>{message}</p>

          {status === "success" && (
            <p className={`text-sm ${isWakanda ? "text-green-100/50" : "text-white/50"}`}>
              Redirecionando para o painel...
            </p>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Link href="/auth">
                <Button
                  className={`w-full ${isWakanda ? "bg-green-600 hover:bg-green-700 text-black font-semibold wakanda-glow" : "bg-purple-600 hover:bg-purple-700"}`}
                >
                  Tentar Novamente
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className={`w-full bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-white/20 text-white hover:bg-white/10"}`}
                >
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
