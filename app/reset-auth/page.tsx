"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Key,
  Database,
  Shield,
  ArrowRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ResetResult {
  success: boolean
  message: string
  tokens_removed?: number
  user_email?: string
  timestamp?: string
  next_step?: string
}

export default function ResetAuthPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResetResult | null>(null)
  const [step, setStep] = useState<"initial" | "resetting" | "completed">("initial")
  const { toast } = useToast()
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    setStep("resetting")
    setResult(null)

    try {
      console.log("🔄 Iniciando reset da autenticação...")

      const response = await fetch("/api/auth/bling/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      console.log("📊 Resultado do reset:", data)

      if (response.ok && data.success) {
        setResult(data)
        setStep("completed")

        toast({
          title: "✅ Reset concluído",
          description: `${data.tokens_removed || 0} token(s) removido(s)`,
        })
      } else {
        throw new Error(data.message || `Erro ${response.status}`)
      }
    } catch (error: any) {
      console.error("❌ Erro no reset:", error)

      setResult({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      })
      setStep("completed")

      toast({
        title: "❌ Erro no reset",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const goToAuth = () => {
    router.push("/configuracao-bling")
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Reset de Autenticação Bling
            </CardTitle>
            <CardDescription className="text-white/70">
              Limpe os tokens de autenticação e reinicie o processo OAuth
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">Tokens OAuth</div>
                  <div className="text-xs text-white/70">Access & Refresh</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">Banco de Dados</div>
                  <div className="text-xs text-white/70">PostgreSQL</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-white">Segurança</div>
                  <div className="text-xs text-white/70">OAuth 2.0</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        {step === "initial" && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Quando usar o Reset?</CardTitle>
              <CardDescription className="text-white/70">
                Use esta função quando encontrar problemas de autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Token Expirado</div>
                    <div className="text-white/70 text-sm">Quando receber erros 401 (Unauthorized) da API do Bling</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Erro de Refresh</div>
                    <div className="text-white/70 text-sm">Quando o refresh token também está inválido</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <RefreshCw className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Nova Configuração</div>
                    <div className="text-white/70 text-sm">Para reconfigurar a integração do zero</div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="text-center">
                <Button
                  onClick={handleReset}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Resetar Autenticação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {step === "resetting" && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto" />
                <div>
                  <div className="text-white font-medium">Resetando autenticação...</div>
                  <div className="text-white/70 text-sm">Removendo tokens do banco de dados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {step === "completed" && result && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                {result.success ? "Reset Concluído" : "Erro no Reset"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert
                className={result.success ? "bg-green-600/20 border-green-500/30" : "bg-red-600/20 border-red-500/30"}
              >
                <AlertDescription className={result.success ? "text-green-200" : "text-red-200"}>
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.success && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/70">Usuário</div>
                      <div className="text-white font-mono">{result.user_email}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Tokens Removidos</div>
                      <Badge variant="outline" className="text-white border-white/20">
                        {result.tokens_removed || 0}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="text-center space-y-3">
                    <div className="text-white font-medium">Próximos Passos:</div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={goToAuth} className="bg-green-600 hover:bg-green-700 text-white">
                        Nova Autenticação OAuth
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button
                        onClick={goToDashboard}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        Ir para Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!result.success && (
                <div className="text-center">
                  <Button
                    onClick={() => setStep("initial")}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}

              {result.timestamp && (
                <div className="text-xs text-white/50 text-center">
                  {new Date(result.timestamp).toLocaleString("pt-BR")}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">Instruções</CardTitle>
          </CardHeader>
          <CardContent className="text-white/70 space-y-2 text-sm">
            <p>
              1. <strong>Reset</strong>: Remove todos os tokens OAuth do banco de dados
            </p>
            <p>
              2. <strong>Nova Auth</strong>: Acesse /configuracao-bling para fazer nova autenticação
            </p>
            <p>
              3. <strong>Teste</strong>: Verifique se a API está funcionando em /dashboard
            </p>
            <p>
              4. <strong>Homologação</strong>: Execute os testes em /homologacao
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
