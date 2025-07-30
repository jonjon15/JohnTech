"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ConfiguracaoBlingPage() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const currentDomain = typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com";
  const redirectUri = `${currentDomain}/auth/callback`;
  const webhookUrl = `${currentDomain}/api/bling/webhooks`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const configSteps = [
    {
      step: 1,
      title: "Acesse o Painel do Bling",
      description: "Entre no seu painel administrativo do Bling",
      action: (
        <Button
          asChild
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
        >
          <Link href="https://www.bling.com.br" target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Bling
          </Link>
        </Button>
      ),
    },
    {
      step: 2,
      title: "Vá para Configurações > Aplicações",
      description: "Navegue até a seção de aplicações e integrações",
      action: null,
    },
    {
      step: 3,
      title: "Encontre sua Aplicação",
      description: "Localize a aplicação com Client ID: 44866dbd8fe131077d73dbe3d60531016512c855",
      action: null,
    },
    {
      step: 4,
      title: "Configure a URL de Redirecionamento",
      description: "Adicione a URL de callback na configuração da aplicação",
      action: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              value={redirectUri}
              readOnly
              className="bg-white/10 border-white/20 text-white font-mono text-sm"
            />
            <Button
              onClick={() => copyToClipboard(redirectUri, "URL de redirecionamento")}
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-white/60">
            Cole esta URL exata no campo "URL de Redirecionamento" no Bling
          </p>
        </div>
      ),
    },
    {
      step: 5,
      title: "Configure a URL do Webhook (Opcional)",
      description: "Para receber notificações em tempo real",
      action: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              value={webhookUrl}
              readOnly
              className="bg-white/10 border-white/20 text-white font-mono text-sm"
            />
            <Button
              onClick={() => copyToClipboard(webhookUrl, "URL do webhook")}
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-white/60">
            Configure esta URL para receber webhooks do Bling
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Alert className="mb-8 bg-yellow-600/10 border-yellow-500/30">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <strong>Importante:</strong> Você precisa configurar a URL de redirecionamento no painel do Bling antes de
            tentar fazer login. Siga os passos abaixo.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {configSteps.map((step) => (
            <Card
              key={step.step}
              className="backdrop-blur-sm bg-white/5 border-white/10"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                  <div>
                    <CardTitle className="text-white">{step.title}</CardTitle>
                    <CardDescription className="text-white/70">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {step.action && <CardContent>{step.action}</CardContent>}
            </Card>
          ))}
        </div>

        <Card className="backdrop-blur-sm bg-white/5 border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Informações da Aplicação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/70">Client ID</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value="44866dbd8fe131077d73dbe3d60531016512c855"
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard("44866dbd8fe131077d73dbe3d60531016512c855", "Client ID")}
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Client Secret</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value="18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1"
                  readOnly
                  type="password"
                  className="bg-white/10 border-white/20 text-white font-mono text-sm"
                />
                <Button
                  onClick={() =>
                    copyToClipboard("18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1", "Client Secret")
                  }
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Domínio Atual</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={currentDomain}
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono text-sm"
                />
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-300" />
                  Detectado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-blue-600/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-300">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-blue-200 space-y-2">
              <li>1. Configure a URL de redirecionamento no Bling conforme instruções acima</li>
              <li>2. Salve as configurações no painel do Bling</li>
              <li>3. Aguarde alguns minutos para as alterações serem aplicadas</li>
              <li>4. Teste a conexão usando o botão \"Conectar com Bling\"</li>
            </ol>
            <div className="mt-6 flex space-x-4">
              <Link href="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Testar Conexão
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Ir para Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}