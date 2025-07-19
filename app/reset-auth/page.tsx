"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function ResetAuthPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/auth/bling/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || "Erro ao resetar autenticação")
      }
    } catch (err) {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reset Autenticação Bling
          </CardTitle>
          <CardDescription>Remove tokens inválidos e permite nova autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleReset} disabled={loading} className="w-full">
            {loading ? "Resetando..." : "Reset Autenticação"}
          </Button>

          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Sucesso!</strong> {result.message}
                <br />
                <strong>Próximo passo:</strong> {result.next_step}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Erro:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-2">
              <Button
                onClick={() => (window.location.href = "/configuracao-bling")}
                className="w-full"
                variant="outline"
              >
                Ir para Configuração Bling
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
