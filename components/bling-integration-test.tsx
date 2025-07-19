"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Play, CheckCircle, XCircle, Clock, Loader2, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  name: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  duration?: number
  details?: any
}

interface TestSuite {
  auth: TestResult
  database: TestResult
  api: TestResult
  products: TestResult
  homologation: TestResult
  // Novas simulações de erro
  simulatedAuthError: TestResult
  simulatedRateLimitError: TestResult
  simulatedInternalServerError: TestResult
}

export default function BlingIntegrationTest() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<TestSuite>({
    auth: { name: "Autenticação", status: "pending" },
    database: { name: "Banco de Dados", status: "pending" },
    api: { name: "API Bling", status: "pending" },
    products: { name: "Produtos", status: "pending" },
    homologation: { name: "Homologação", status: "pending" },
    // Inicializa os novos testes simulados
    simulatedAuthError: { name: "Simulação: Auth Inválida", status: "pending" },
    simulatedRateLimitError: { name: "Simulação: Rate Limit", status: "pending" },
    simulatedInternalServerError: { name: "Simulação: Erro Interno", status: "pending" },
  })
  const { toast } = useToast()

  const updateTestResult = (key: keyof TestSuite, update: Partial<TestResult>) => {
    setResults((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...update },
    }))
  }

  const runTest = async (
    key: keyof TestSuite,
    testFn: () => Promise<{ success: boolean; message: string; details?: any }>,
  ) => {
    const startTime = Date.now()
    updateTestResult(key, { status: "running" })

    try {
      const result = await testFn()
      const duration = Date.now() - startTime

      updateTestResult(key, {
        status: result.success ? "success" : "error",
        message: result.message,
        duration,
        details: result.details,
      })

      return result.success
    } catch (error: any) {
      const duration = Date.now() - startTime
      updateTestResult(key, {
        status: "error",
        message: error.message,
        duration,
      })
      return false
    }
  }

  const testAuth = async () => {
    const response = await fetch("/api/auth/bling/status")
    const data = await response.json()

    if (response.ok && data.authenticated) {
      return {
        success: true,
        message: `Token válido até ${new Date(data.expires_at).toLocaleString()}`,
        details: data,
      }
    } else {
      return {
        success: false,
        message: data.message || "Token não encontrado ou inválido",
        details: data,
      }
    }
  }

  const testDatabase = async () => {
    const response = await fetch("/api/db/status")
    const data = await response.json()

    if (response.ok && data.connected) {
      return {
        success: true,
        message: `Conectado - ${data.database_name}`,
        details: data,
      }
    } else {
      return {
        success: false,
        message: data.error || "Erro de conexão",
        details: data,
      }
    }
  }

  const testApi = async () => {
    const response = await fetch("/api/bling/status")
    const data = await response.json()

    if (response.ok && data.api_available) {
      return {
        success: true,
        message: `API respondendo em ${data.response_time}ms`,
        details: data,
      }
    } else {
      return {
        success: false,
        message: data.error || "API indisponível",
        details: data,
      }
    }
  }

  const testProducts = async () => {
    const response = await fetch("/api/bling/products")
    const data = await response.json()

    if (response.ok && data.success) {
      const productCount = data.data?.data?.length || 0
      return {
        success: true,
        message: `${productCount} produtos encontrados`,
        details: data,
      }
    } else {
      return {
        success: false,
        message: data.error?.message || "Erro ao buscar produtos",
        details: data,
      }
    }
  }

  const testHomologation = async () => {
    const response = await fetch("/api/bling/homologacao/produtos")
    const data = await response.json()

    if (response.ok && data.success) {
      const productCount = data.data?.data?.length || 0
      return {
        success: true,
        message: `${productCount} produtos de homologação`,
        details: data,
      }
    } else {
      return {
        success: false,
        message: data.error?.message || "Erro na homologação",
        details: data,
      }
    }
  }

  // --- Novas Funções de Teste Simulado ---
  const simulateAuthError = async () => {
    // Simula um erro 401 Unauthorized (Token inválido) da API Bling
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simula atraso de rede
    return {
      success: false,
      message: "Token Bling inválido ou expirado (simulado)",
      details: {
        error: {
          code: "40101", // Código de erro Bling para token inválido
          message: "Token de acesso inválido ou expirado.",
          statusCode: 401,
        },
      },
    }
  }

  const simulateRateLimitError = async () => {
    // Simula um erro 429 Too Many Requests (Limite de requisições excedido) da API Bling
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simula atraso de rede
    return {
      success: false,
      message: "Limite de requisições excedido (simulado)",
      details: {
        error: {
          code: "42901", // Código de erro Bling para limite de requisições
          message: "Limite de requisições excedido. Tente novamente mais tarde.",
          statusCode: 429,
        },
      },
    }
  }

  const simulateInternalServerError = async () => {
    // Simula um erro 500 Internal Server Error (Erro interno do servidor) da API Bling
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simula atraso de rede
    return {
      success: false,
      message: "Erro interno do servidor Bling (simulado)",
      details: {
        error: {
          code: "50001", // Código de erro Bling para erro interno
          message: "Ocorreu um erro interno no servidor Bling.",
          statusCode: 500,
        },
      },
    }
  }
  // --- Fim das Novas Funções de Teste Simulado ---

  const runAllTests = async () => {
    setRunning(true)
    setProgress(0)

    const tests = [
      { key: "auth" as const, fn: testAuth, weight: 12.5 },
      { key: "database" as const, fn: testDatabase, weight: 12.5 },
      { key: "api" as const, fn: testApi, weight: 12.5 },
      { key: "products" as const, fn: testProducts, weight: 12.5 },
      { key: "homologation" as const, fn: testHomologation, weight: 12.5 },
      // Adiciona os novos testes simulados
      { key: "simulatedAuthError" as const, fn: simulateAuthError, weight: 12.5 },
      { key: "simulatedRateLimitError" as const, fn: simulateRateLimitError, weight: 12.5 },
      { key: "simulatedInternalServerError" as const, fn: simulateInternalServerError, weight: 12.5 },
    ]

    let currentProgress = 0
    let successCount = 0

    for (const test of tests) {
      const success = await runTest(test.key, test.fn)
      if (success) successCount++

      currentProgress += test.weight
      setProgress(currentProgress)

      // Pequena pausa entre testes
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setRunning(false)

    // Toast final
    if (successCount === tests.length) {
      toast({
        title: "✅ Todos os testes passaram!",
        description: "Integração Bling funcionando perfeitamente",
      })
    } else {
      toast({
        title: `⚠️ ${successCount}/${tests.length} testes passaram`,
        description: "Verifique os erros e tente novamente",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-600/20 border-gray-500/30"
      case "running":
        return "bg-blue-600/20 border-blue-500/30"
      case "success":
        return "bg-green-600/20 border-green-500/30"
      case "error":
        return "bg-red-600/20 border-red-500/30"
    }
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Teste de Integração Bling
        </CardTitle>
        <CardDescription className="text-white/70">
          Verificação completa da conectividade e funcionalidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botão de execução */}
        <div className="text-center">
          <Button
            onClick={runAllTests}
            disabled={running}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar Todos os Testes
              </>
            )}
          </Button>
        </div>

        {/* Barra de progresso */}
        {running && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/70">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="bg-white/10" />
          </div>
        )}

        {/* Resultados dos testes */}
        <div className="space-y-3">
          {Object.entries(results).map(([key, result]) => (
            <div key={key} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="text-white font-medium">{result.name}</div>
                    {result.message && <div className="text-white/70 text-sm">{result.message}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.duration && (
                    <Badge variant="outline" className="text-white border-white/20">
                      {result.duration}ms
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`border-white/20 ${
                      result.status === "success"
                        ? "text-green-400"
                        : result.status === "error"
                          ? "text-red-400"
                          : "text-white"
                    }`}
                  >
                    {result.status === "pending" && "Aguardando"}
                    {result.status === "running" && "Executando"}
                    {result.status === "success" && "Sucesso"}
                    {result.status === "error" && "Erro"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <Separator className="bg-white/10" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {Object.values(results).filter((r) => r.status === "success").length}
            </div>
            <div className="text-white/70 text-sm">Sucessos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {Object.values(results).filter((r) => r.status === "error").length}
            </div>
            <div className="text-white/70 text-sm">Erros</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">
              {Object.values(results).filter((r) => r.status === "pending").length}
            </div>
            <div className="text-white/70 text-sm">Pendentes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
