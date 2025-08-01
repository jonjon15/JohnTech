"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processando autorização...")

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams?.get("code") ?? ""
      const state = searchParams?.get("state") ?? ""
      const error = searchParams?.get("error") ?? ""

      if (error) {
        setStatus("error")
        setMessage(`Erro na autorização: ${error}`)
        return
      }

      if (!code) {
        setStatus("error")
        setMessage("Código de autorização não encontrado")
        return
      }

      try {
        const response = await fetch("/api/auth/bling/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        })

        const data = await response.json()

        if (response.ok) {
          // Após sucesso, criar sessão NextAuth
          const signInRes = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@example.com", password: "bling-oauth" })
          })
          if (signInRes.ok) {
            setStatus("success")
            setMessage("Autorização concluída com sucesso!")
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          } else {
            setStatus("error")
            setMessage("Falha ao criar sessão. Tente novamente.")
          }
        } else {
          setStatus("error")
          setMessage(data.error || "Erro ao obter token")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Erro de conexão")
      }
    }

    processCallback()
  }, [searchParams, router])

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-12 w-12 text-green-400 animate-spin" />
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-400" />
      case "error":
        return <XCircle className="h-12 w-12 text-red-400" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Processando Autorização..."
      case "success":
        return "Autorização Concluída"
      case "error":
        return "Erro na Autorização"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center p-0 border-none shadow-none bg-transparent">
          <div className="flex justify-center mb-2">{getIcon()}</div>
          <CardTitle className="text-white/70 text-base font-semibold">{getTitle()}</CardTitle>
          <CardDescription className="text-white/40 text-xs mt-1">Integração com Bling API</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-white/80 mb-4">{message}</p>
          {status === "error" && (
            <Button
              onClick={() => router.push("/configuracao-bling")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Tentar Novamente
            </Button>
          )}
          {status === "success" && <p className="text-green-400 text-sm">Redirecionando para o dashboard...</p>}
        </CardContent>
      </Card>
    </div>
  )
}
