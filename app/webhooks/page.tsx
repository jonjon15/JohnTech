"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Webhook, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/contexts/theme-context"

export default function WebhooksPage() {
  const [webhookSecret, setWebhookSecret] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<"checking" | "active" | "inactive">("checking")
  const { toast } = useToast()
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"

  const currentDomain = typeof window !== "undefined" ? window.location.origin : "https://johntech.vercel.app"
  const webhookUrl = `${currentDomain}/api/bling/webhooks`

  useEffect(() => {
    checkWebhookStatus()
    // Removido qualquer polling automático. Só buscar status ao abrir a página ou após ações do usuário.
  }, [])

  const generateWebhookSecret = () => {
    setIsGenerating(true)

    // Simula geração de chave (em produção, isso seria feito no servidor)
    setTimeout(() => {
      const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

      setWebhookSecret(secret)
      setIsGenerating(false)

      toast({
        title: "Webhook Secret Gerado!",
        description: "Copie e configure esta chave nas suas variáveis de ambiente",
      })
    }, 1000)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    })
  }

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch("/api/bling/webhooks/status")
      const data = await response.json()
      setWebhookStatus(data.configured ? "active" : "inactive")
    } catch (error) {
      setWebhookStatus("inactive")
    }
  }

  const testWebhook = async () => {
    try {
      const response = await fetch("/api/bling/webhooks/test", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Teste realizado!",
          description: "Webhook está funcionando corretamente",
        })
      } else {
        toast({
          title: "Erro no teste",
          description: data.error || "Falha ao testar webhook",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook",
        variant: "destructive",
      })
    }
  }

  const webhookEvents = [
    { event: "produto.criado", description: "Quando um produto é criado no Bling" },
    { event: "produto.alterado", description: "Quando um produto é modificado no Bling" },
    { event: "produto.excluido", description: "Quando um produto é excluído no Bling" },
    { event: "estoque.alterado", description: "Quando o estoque de um produto é alterado" },
    { event: "pedido.criado", description: "Quando um novo pedido é criado" },
    { event: "pedido.alterado", description: "Quando um pedido é modificado" },
    { event: "nfe.autorizada", description: "Quando uma NFe é autorizada" },
    { event: "nfe.cancelada", description: "Quando uma NFe é cancelada" },
  ]

  return (
    <div
      className={`min-h-screen pt-20 ${isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"}`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isWakanda ? "text-green-100" : "text-white"} mb-2`}>
            Configuração de Webhooks
          </h1>
          <p className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
            Configure webhooks para receber notificações em tempo real do Bling
          </p>
        </div>

        {/* Status Card */}
        <Card
          className={`backdrop-blur-sm mb-6 ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"} flex items-center gap-2`}>
                  <Webhook className="h-5 w-5" />
                  Status dos Webhooks
                </CardTitle>
                <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                  Estado atual da configuração de webhooks
                </CardDescription>
              </div>
              <Badge
                variant={webhookStatus === "active" ? "default" : "secondary"}
                className={
                  webhookStatus === "active"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }
              >
                {webhookStatus === "checking" ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Verificando
                  </>
                ) : webhookStatus === "active" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Inativo
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>URL do Webhook</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className={`bg-white/10 border-white/20 text-white font-mono text-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100" : ""}`}
                  />
                  <Button
                    onClick={() => copyToClipboard(webhookUrl, "URL do webhook")}
                    size="sm"
                    variant="outline"
                    className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={checkWebhookStatus}
                  variant="outline"
                  size="sm"
                  className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""}`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </Button>
                <Button
                  onClick={testWebhook}
                  variant="outline"
                  size="sm"
                  className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""}`}
                >
                  Testar Webhook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Secret Generation */}
        <Card
          className={`backdrop-blur-sm mb-6 ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
        >
          <CardHeader>
            <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"}`}>Gerar Webhook Secret</CardTitle>
            <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
              Chave secreta para validar a autenticidade dos webhooks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert
              className={`${isWakanda ? "bg-yellow-600/10 border-yellow-500/30" : "bg-yellow-600/10 border-yellow-500/30"}`}
            >
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                <strong>Importante:</strong> O webhook secret é uma chave que você define para garantir que os webhooks
                recebidos realmente vêm do Bling. Guarde esta chave em local seguro!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button
                onClick={generateWebhookSecret}
                disabled={isGenerating}
                className={`${isWakanda ? "bg-green-600 hover:bg-green-700 text-black font-semibold wakanda-glow" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Webhook Secret"
                )}
              </Button>

              {webhookSecret && (
                <div className="space-y-2">
                  <Label className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                    Webhook Secret Gerado
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={webhookSecret}
                      readOnly
                      className={`bg-white/10 border-white/20 text-white font-mono text-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100" : ""}`}
                    />
                    <Button
                      onClick={() => copyToClipboard(webhookSecret, "Webhook Secret")}
                      size="sm"
                      variant="outline"
                      className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-xs ${isWakanda ? "text-green-100/60" : "text-white/60"}`}>
                      1. Copie esta chave e adicione como variável de ambiente: <code>BLING_WEBHOOK_SECRET</code>
                    </p>
                    <p className={`text-xs ${isWakanda ? "text-green-100/60" : "text-white/60"}`}>
                      2. Configure esta mesma chave no painel do Bling ao cadastrar o webhook
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Events */}
        <Card
          className={`backdrop-blur-sm mb-6 ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
        >
          <CardHeader>
            <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"}`}>Eventos Suportados</CardTitle>
            <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
              Tipos de eventos que seu sistema pode receber do Bling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {webhookEvents.map((event, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isWakanda ? "bg-green-950/30" : "bg-white/5"}`}
                >
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className={`font-medium ${isWakanda ? "text-green-100" : "text-white"}`}>{event.event}</div>
                    <div className={`text-sm ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                      {event.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className={`${isWakanda ? "bg-blue-600/10 border-blue-500/30" : "bg-blue-600/10 border-blue-500/30"}`}>
          <CardHeader>
            <CardTitle className="text-blue-300">Como Configurar no Bling</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-blue-200 space-y-2">
              <li>1. Gere um webhook secret usando o botão acima</li>
              <li>
                2. Adicione a variável <code>BLING_WEBHOOK_SECRET</code> no seu ambiente
              </li>
              <li>3. Acesse o painel do Bling → Configurações → Webhooks</li>
              <li>
                4. Cadastre a URL: <code>{webhookUrl}</code>
              </li>
              <li>5. Configure o mesmo secret gerado acima</li>
              <li>6. Selecione os eventos que deseja receber</li>
              <li>7. Teste a configuração usando o botão "Testar Webhook"</li>
            </ol>
            <div className="mt-6">
              <Button
                asChild
                className={`${isWakanda ? "bg-green-600 hover:bg-green-700 text-black font-semibold wakanda-glow" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                <a href="https://www.bling.com.br" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Painel do Bling
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
