"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function ResetAuthPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Iniciando reset da autenticação...")

      const response = await fetch("/api/auth/bling/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      console.log("Resposta do reset:", data)

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Erro ao resetar autenticação")
      }
    } catch (err: any) {
      console.error("Erro no reset:", err)
      setError(err.message || "Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6" />
            Reset Autenticação Bling
          </CardTitle>
          <CardDescription className="text-white/70">
            Limpar tokens inválidos e forçar nova autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleReset} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resetando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Autenticação
              </>
            )}
          </Button>

          {result && (
            <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-300 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Sucesso!</span>
              </div>
              <p className="text-green-200 text-sm">{result.message}</p>
              {result.tokens_removed && (
                <p className="text-green-200 text-sm mt-1">Tokens removidos: {result.tokens_removed}</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-300 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Erro!</span>
              </div>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <Link href="/configuracao-bling">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
                Ir para Configuração Bling
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="text-white/60 hover:text-white text-sm">
              ← Voltar ao início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
