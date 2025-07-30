"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, RefreshCw, Database, Webhook, Key, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/contexts/theme-context"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: any
}

export default function BlingIntegrationTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const { toast } = useToast()

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      { name: "Banco de Dados", endpoint: "/api/db/status", icon: Database },
      { name: "Autenticação OAuth", endpoint: "/api/auth/bling/status", icon: Key },
      { name: "API do Bling", endpoint: "/api/bling/status", icon: Globe },
      { name: "Webhooks", endpoint: "/api/bling/webhooks/status", icon: Webhook },
    ]

    for (const test of tests) {
      setResults((prev) => [...prev, { name: test.name, status: "loading", message: "Testando..." }])

      try {
        const response = await fetch(test.endpoint)
        const data = await response.json()

        setResults((prev) =>
          prev.map((result) =>
            result.name === test.name
              ? {
                  name: test.name,
                  status: response.ok ? "success" : "error",
                  message: data.message || (response.ok ? "Funcionando corretamente" : "Erro na configuração"),
                  details: data,
                }
              : result,
          ),
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((result) =>
            result.name === test.name
              ? {
                  name: test.name,
                  status: "error",
                  message: error instanceof Error ? error.message : "Erro desconhecido",
                }
              : result,
          ),
        )
      }

      // Pequena pausa entre os testes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)

    // Mostra resultado geral
    const hasErrors = results.some((r) => r.status === "error")
    const hasWarnings = results.some((r) => r.status === "warning")

    if (!hasErrors && !hasWarnings) {
      toast({
        title: "✅ Todos os testes passaram!",
        description: "Sua integração com o Bling está funcionando corretamente",
      })
    } else if (hasErrors) {
      toast({
        title: "❌ Alguns testes falharam",
        description: "Verifique as configurações e tente novamente",
        variant: "destructive",
      })
    } else {
      toast({
        title: "⚠️ Testes com avisos",
        description: "Algumas configurações podem precisar de atenção",
      })
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "loading":
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "loading":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="backdrop-blur-sm mt-8 bg-white/5 border-white/10">
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Teste de Integração
        </CardTitle>
        <CardDescription className="text-white/70">
          Verifique se todos os componentes estão funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runTests}
          disabled={isRunning}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Executando Testes...
            </>
          ) : (
            "Executar Testes de Integração"
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium text-white">{result.name}</div>
                    <div className="text-sm text-white/70">
                      {result.message}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(result.status)}>
                  {result.status === "loading" ? "Testando" : result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <Alert
            className={`${
              results.every((r) => r.status === "success")
                ? false
                  ? "bg-green-600/10 border-green-500/30"
                  : "bg-green-600/10 border-green-500/30"
                : "bg-red-600/10 border-red-500/30"
            }`}
          >
            {results.every((r) => r.status === "success") ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription
              className={results.every((r) => r.status === "success") ? "text-green-200" : "text-red-200"}
            >
              {results.every((r) => r.status === "success")
                ? "🎉 Parabéns! Todos os componentes estão funcionando corretamente. Sua integração com o Bling está pronta para uso."
                : "⚠️ Alguns componentes precisam de atenção. Verifique as configurações e variáveis de ambiente."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
