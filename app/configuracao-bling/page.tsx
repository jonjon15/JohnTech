"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Settings, ExternalLink, RefreshCw, Trash2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface AuthStatus {
  authenticated: boolean
  user_email?: string
  expires_at?: string
  created_at?: string
  error?: string
}

export default function ConfiguracaoBlingPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const searchParams = useSearchParams()

  // Verificar status da autenticação
  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/bling/status")
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      setAuthStatus({ authenticated: false, error: "Erro ao verificar status" })
    } finally {
      setLoading(false)
    }
  }

  // Iniciar processo de autenticação
  const startAuth = async () => {
    try {
      setActionLoading(true)
      window.location.href = "/api/bling/oauth/authorize"
    } catch (error) {
      console.error("Erro ao iniciar autenticação:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Resetar autenticação
  const resetAuth = async () => {
    if (!confirm("Tem certeza que deseja remover a autenticação atual?")) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch("/api/auth/bling/reset", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        await checkAuthStatus()
      } else {
        console.error("Erro ao resetar:", data.error)
      }
    } catch (error) {
      console.error("Erro ao resetar autenticação:", error)
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Verificar parâmetros da URL (retorno do OAuth)
  const success = searchParams.get("success")
  const error = searchParams.get("error")
  const message = searchParams.get("message")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuração Bling
        </h1>
        <p className="text-muted-foreground">
          Configure a integração OAuth com a API do Bling para sincronizar produtos e pedidos.
        </p>
      </div>

      {/* Mensagens de Status */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message || "Autenticação realizada com sucesso!"}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message || `Erro: ${error}`}</AlertDescription>
        </Alert>
      )}

      {/* Status da Autenticação */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Status da Autenticação
            <Button variant="outline" size="sm" onClick={checkAuthStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
          <CardDescription>Verifique se a conexão com o Bling está ativa</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Verificando status...</span>
            </div>
          ) : authStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {authStatus.authenticated ? (
                  <>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                    <span className="text-sm text-muted-foreground">Usuário: {authStatus.user_email}</span>
                  </>
                ) : (
                  <>
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Não Conectado
                    </Badge>
                    {authStatus.error && <span className="text-sm text-red-600">{authStatus.error}</span>}
                  </>
                )}
              </div>

              {authStatus.authenticated && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {authStatus.created_at && (
                    <div>Conectado em: {new Date(authStatus.created_at).toLocaleString("pt-BR")}</div>
                  )}
                  {authStatus.expires_at && (
                    <div>Expira em: {new Date(authStatus.expires_at).toLocaleString("pt-BR")}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-600">Erro ao carregar status</div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>Gerencie sua conexão com o Bling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authStatus?.authenticated ? (
            <div>
              <Button onClick={startAuth} disabled={actionLoading} className="w-full sm:w-auto">
                <ExternalLink className="h-4 w-4 mr-2" />
                {actionLoading ? "Redirecionando..." : "Conectar com Bling"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Você será redirecionado para o Bling para autorizar a integração.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Button onClick={resetAuth} variant="destructive" disabled={actionLoading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {actionLoading ? "Removendo..." : "Remover Conexão"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Remove a autenticação atual. Você precisará se conectar novamente.
                </p>
              </div>

              <Separator />

              <div>
                <Button variant="outline" asChild>
                  <a href="/homologacao">
                    <Settings className="h-4 w-4 mr-2" />
                    Ir para Homologação
                  </a>
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Teste a integração criando e gerenciando produtos.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>API Bling:</strong> {process.env.NEXT_PUBLIC_BLING_API_URL || "https://www.bling.com.br/Api/v3"}
            </div>
            <div>
              <strong>Client ID:</strong> {process.env.NEXT_PUBLIC_BLING_CLIENT_ID ? "Configurado" : "Não configurado"}
            </div>
            <div>
              <strong>Redirect URI:</strong>{" "}
              {typeof window !== "undefined" ? `${window.location.origin}/api/auth/bling/callback` : "N/A"}
            </div>
            <div>
              <strong>Ambiente:</strong> {process.env.NODE_ENV || "development"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
