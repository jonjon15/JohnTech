"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const error = searchParams.get("error")

      console.log("Callback params:", { code: code?.substring(0, 10) + "...", state, error })

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
        console.log("Enviando código para /api/auth/bling/token...")

        const response = await fetch("/api/auth/bling/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        })

        const data = await response.json()

        console.log("Resposta do token endpoint:", { status: response.status, data })

        if (response.ok) {
          setStatus("success")
          setMessage("Autorização realizada com sucesso!")
          setDetails(data)

          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Erro ao processar autorização")
          setDetails(data.details || null)
        }
      } catch (error) {
        console.error("Erro na requisição:", error)
        setStatus("error")
        setMessage("Erro de conexão")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white">
            {status === "loading" && "Processando Autorização..."}
            {status === "success" && "Autorização Concluída!"}
            {status === "error" && "Erro na Autorização"}
          </CardTitle>
          <CardDescription className="text-gray-400">Integração com Bling API</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto" />}

          {status === "success" && <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />}

          {status === "error" && <XCircle className="h-12 w-12 text-red-500 mx-auto" />}

          <p className="text-gray-300">{message}</p>

          {status === "success" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Redirecionando para o dashboard em 3 segundos...</p>
              {details && (
                <div className="text-xs text-gray-500">
                  <p>Token válido por: {details.expires_in} segundos</p>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              {details && (
                <div className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                  <pre>{JSON.stringify(details, null, 2)}</pre>
                </div>
              )}
              <Button onClick={() => router.push("/configuracao-bling")} className="bg-green-600 hover:bg-green-700">
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
