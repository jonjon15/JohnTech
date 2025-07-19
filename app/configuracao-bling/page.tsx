"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react"

export default function ConfiguracaoBlingPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/bling/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Erro ao buscar status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    setAuthLoading(true)
    try {
      const response = await fetch("/api/auth/bling")
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error("Erro na autenticação:", error)
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Verificar parâmetros de URL para feedback
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const error = urlParams.get("error")
    const message = urlParams.get("message")

    if (success === "true") {
      // Mostrar mensagem de sucesso
      setTimeout(() => {
        fetchStatus() // Atualizar status após sucesso
      }, 1000)
    }

    if (error) {
      console.error("Erro OAuth:", error, message)
    }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração Bling</h1>
          <p className="text-muted-foreground">Configure a integração com a API do Bling</p>
        </div>
        <Button onClick={fetchStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Status
        </Button>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status da Integração
            {status?.bling?.authenticated ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Desconectado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Status atual da conexão com o Bling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Banco de Dados</h4>
              <div className="flex items-center gap-2">
                {status?.database?.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{status?.database?.connected ? "Conectado" : "Desconectado"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Autenticação Bling</h4>
              <div className="flex items-center gap-2">
                {status?.bling?.authenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{status?.bling?.authenticated ? "Autenticado" : "Não autenticado"}</span>
              </div>
            </div>
          </div>

          {status?.bling?.userEmail && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Usuário: <span className="font-medium">{status.bling.userEmail}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração de Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>Variáveis de Ambiente</CardTitle>
          <CardDescription>Verificação das configurações necessárias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">BLING_CLIENT_ID</span>
              {status?.environment?.hasClientId ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">BLING_CLIENT_SECRET</span>
              {status?.environment?.hasClientSecret ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">NEXT_PUBLIC_BASE_URL</span>
              {status?.environment?.hasBaseUrl ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">BLING_WEBHOOK_SECRET</span>
              {status?.environment?.hasWebhookSecret ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>Configure ou reconecte sua integração com o Bling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.bling?.authenticated ? (
            <Alert>
              <AlertDescription>
                Você precisa autenticar com o Bling para usar a integração. Clique no botão abaixo para iniciar o
                processo de autenticação OAuth.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                Integração configurada com sucesso! Você pode testar as funcionalidades ou reautenticar se necessário.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button onClick={handleAuth} disabled={authLoading} className="flex items-center gap-2">
              {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              {status?.bling?.authenticated ? "Reautenticar" : "Conectar com Bling"}
            </Button>

            {status?.bling?.authenticated && (
              <Button variant="outline" asChild>
                <a href="/dashboard">Ir para Dashboard</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links Úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
          <CardDescription>Recursos e documentação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col space-y-2">
            <a
              href="https://developer.bling.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Documentação da API Bling
            </a>
            <a
              href="/api/bling/status"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Status da API (JSON)
            </a>
            <a
              href="/api/bling/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Endpoint de Webhooks
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
