"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, ArrowRight, Clock } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const messageParam = searchParams.get("message")
    const elapsedTime = searchParams.get("elapsed_time")

    if (success === "true") {
      setStatus("success")
      setMessage(messageParam || "Autenticação realizada com sucesso!")
      setDetails({ elapsed_time: elapsedTime })
    } else if (error) {
      setStatus("error")
      setMessage(messageParam || "Erro na autenticação")
      setDetails({ error_code: error, elapsed_time: elapsedTime })
    } else {
      // Se não há parâmetros, ainda está processando
      setTimeout(() => {
        if (status === "loading") {
          setStatus("error")
          setMessage("Timeout no processamento da autenticação")
        }
      }, 10000) // 10 segundos timeout
    }
  }, [searchParams, status])

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  const goToConfig = () => {
    router.push("/configuracao-bling")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-400" />}
            {status === "error" && <XCircle className="h-6 w-6 text-red-400" />}

            {status === "loading" && "Processando..."}
            {status === "success" && "Sucesso!"}
            {status === "error" && "Erro"}
          </CardTitle>
          <CardDescription className="text-white/70">
            {status === "loading" && "Finalizando autenticação OAuth"}
            {status === "success" && "Integração Bling configurada"}
            {status === "error" && "Falha na autenticação"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert
            className={
              status === "success"
                ? "bg-green-600/20 border-green-500/30"
                : status === "error"
                  ? "bg-red-600/20 border-red-500/30"
                  : "bg-blue-600/20 border-blue-500/30"
            }
          >
            <AlertDescription
              className={
                status === "success" ? "text-green-200" : status === "error" ? "text-red-200" : "text-blue-200"
              }
            >
              {message}
            </AlertDescription>
          </Alert>

          {details && (
            <div className="space-y-2">
              {details.elapsed_time && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Tempo de processamento:</span>
                  <Badge variant="outline" className="text-white border-white/20">
                    <Clock className="h-3 w-3 mr-1" />
                    {details.elapsed_time}ms
                  </Badge>
                </div>
              )}

              {details.error_code && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Código do erro:</span>
                  <Badge variant="outline" className="text-red-400 border-red-400/20">
                    {details.error_code}
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-4">
            {status === "success" && (
              <Button onClick={goToDashboard} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Ir para Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {status === "error" && (
              <Button onClick={goToConfig} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Tentar Novamente
              </Button>
            )}

            {status === "loading" && (
              <div className="text-center text-white/70 text-sm">Aguarde enquanto processamos sua autenticação...</div>
            )}
          </div>

          <div className="text-center pt-2">
            <button onClick={() => router.push("/")} className="text-white/60 hover:text-white text-sm">
              ← Voltar ao início
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
