"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw, Settings } from "lucide-react"

interface AuthStatus {
  authenticated: boolean
  expiresAt?: string
  userInfo?: {
    id: number
    nome: string
    email: string
  }
}

interface IntegrationStatus {
  authentication: AuthStatus
  api: {
    connected: boolean
    rateLimit: {
      limit: number
      remaining: number
      resetAt: string
    }
  }
  webhooks: {
    total: number
    processados: number
    pendentes: number
    erros: number
    ultimoEvento?: string
  }
  overall: {
    status: "healthy" | "error"
    message: string
  }
}

export default function ConfiguracaoBlingPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Verifica parâmetros da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    const successParam = urlParams.get("success")

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
    if (successParam) {
      setSuccess("Autenticação realizada com sucesso!")
    }

    // Remove parâmetros da URL
    if (errorParam || successParam) {
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  // Carrega status da integração
  const loadStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bling/status")
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("Erro ao carregar status:", err)
      setError("Erro ao carregar status da integração")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  // Inicia processo de autenticação
  const handleAuthenticate = async () => {
    try {
      const response = await fetch("/api/auth/bling")
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError("Erro ao gerar URL de autenticação")
      }
    } catch (err) {
      console.error("Erro ao autenticar:", err)
      setError("Erro ao iniciar autenticação")
    }
  }

  // Revoga autenticação
  const handleRevoke = async () => {
    if (!confirm("Tem certeza que deseja revogar a autenticação?")) {
      return
    }

    try {
      const response = await fetch("/api/auth/bling/reset", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setSuccess("Autenticação revogada com sucesso")
        loadStatus()
      } else {
        setError(data.error || "Erro ao revogar autenticação")
      }
    } catch (err) {
      console.error("Erro ao revogar:", err)
      setError("Erro ao revogar autenticação")
    }
  }

  // Testa conexão
  const handleTestConnection = async () => {
    try {
      setLoading(true)
      await loadStatus()
      setSuccess("Conexão testada com sucesso")
    } catch (err) {
      setError("Erro ao testar conexão")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (connected: boolean) => {
    return <Badge variant={connected ? "default" : "destructive"}>{connected ? "Conectado" : "Desconectado"}</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração Bling</h1>
          <p className="text-muted-foreground">Configure a integração com a API do Bling</p>
        </div>
        <Button onClick={loadStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Status Geral */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(status.overall.status)}
              Status da Integração
            </CardTitle>
            <CardDescription>{status.overall.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Autenticação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Autenticação OAuth 2.0
              {status && getStatusBadge(status.authentication.authenticated)}
            </CardTitle>
            <CardDescription>Conecte sua conta do Bling para acessar a API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.authentication.authenticated ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Usuário:</p>
                  <p className="text-sm text-muted-foreground">
                    {status.authentication.userInfo?.nome || "Não disponível"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p className="text-sm text-muted-foreground">
                    {status.authentication.userInfo?.email || "Não disponível"}
                  </p>
                </div>
                {status.authentication.expiresAt && (
                  <div>
                    <p className="text-sm font-medium">Expira em:</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(status.authentication.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={handleTestConnection} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </Button>
                  <Button onClick={handleRevoke} variant="destructive" size="sm">
                    Revogar Acesso
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Para usar a integração, você precisa autorizar o acesso à sua conta do Bling.
                </p>
                <Button onClick={handleAuthenticate} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Conectar com Bling
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status da API
              {status && getStatusBadge(status.api.connected)}
            </CardTitle>
            <CardDescription>Informações sobre a conectividade com a API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.api && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Rate Limit:</p>
                  <p className="text-sm text-muted-foreground">
                    {status.api.rateLimit.remaining} / {status.api.rateLimit.limit} requisições restantes
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reset em:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(status.api.rateLimit.resetAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>Estatísticas de eventos recebidos do Bling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status?.webhooks && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{status.webhooks.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{status.webhooks.processados}</p>
                  <p className="text-sm text-muted-foreground">Processados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{status.webhooks.pendentes}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{status.webhooks.erros}</p>
                  <p className="text-sm text-muted-foreground">Erros</p>
                </div>
              </div>
            )}
            {status?.webhooks.ultimoEvento && (
              <div>
                <p className="text-sm font-medium">Último evento:</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(status.webhooks.ultimoEvento).toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links Úteis */}
        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
            <CardDescription>Documentação e recursos do Bling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="https://developer.bling.com.br" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentação da API
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="https://www.bling.com.br/aplicativos" target="_blank" rel="noopener noreferrer">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Aplicativos
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <a href="/api/bling/status" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Status JSON
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
