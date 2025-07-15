"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Scan, TrendingUp, Zap, Shield, Globe } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isWakanda = theme === "wakanda"

  return (
    <div
      className={`min-h-screen ${isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"}`}
    >
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge
              className={`mb-6 ${isWakanda ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-purple-600/20 text-purple-300 border-purple-500/30"}`}
            >
              {isWakanda ? "Tecnologia Wakandiana" : "Gestão Premium de Estoque"}
            </Badge>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight ${isWakanda ? "text-green-100" : "text-white"}`}
            >
              {isWakanda ? (
                <>
                  O Futuro do
                  <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Controle de Estoque
                  </span>
                </>
              ) : (
                <>
                  Revolucione Seu
                  <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Controle de Estoque
                  </span>
                </>
              )}
            </h1>
            <p
              className={`text-xl mb-8 max-w-3xl mx-auto leading-relaxed ${isWakanda ? "text-green-100/70" : "text-white/70"}`}
            >
              {isWakanda
                ? "Tecnologia avançada inspirada em Wakanda para revolucionar sua gestão de estoque com precisão e eficiência incomparáveis."
                : "Integre perfeitamente com o ERP Bling, gerencie seu estoque com precisão e prepare-se para o futuro com recursos de leitura de código de barras."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isWakanda ? "text-green-100" : "text-white"}`}>
              {isWakanda ? "Tecnologias Avançadas" : "Recursos Poderosos"}
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
              {isWakanda
                ? "Ferramentas de última geração para dominar o controle de estoque"
                : "Tudo que você precisa para gerenciar seu estoque com precisão empresarial"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: isWakanda ? "Integração Quântica" : "Integração Bling",
                description: isWakanda
                  ? "Conexão instantânea com ERP Bling usando protocolos avançados de sincronização"
                  : "Integração OAuth2 completa com ERP Bling para gestão perfeita de estoque",
              },
              {
                icon: Scan,
                title: isWakanda ? "Scanner Holográfico" : "Pronto para Código de Barras",
                description: isWakanda
                  ? "Tecnologia de escaneamento avançada preparada para dispositivos de próxima geração"
                  : "Arquitetura preparada para integração de leitura de código de barras Android",
              },
              {
                icon: TrendingUp,
                title: isWakanda ? "Análise Preditiva" : "Análises em Tempo Real",
                description: isWakanda
                  ? "IA avançada para previsão de demanda e otimização automática de estoque"
                  : "Rastreamento de estoque ao vivo com análises avançadas e relatórios",
              },
              {
                icon: Shield,
                title: isWakanda ? "Proteção Vibranium" : "Segurança Empresarial",
                description: isWakanda
                  ? "Criptografia de nível militar com proteção multicamadas de dados"
                  : "Segurança de nível bancário com transmissão de dados criptografada",
              },
              {
                icon: Zap,
                title: isWakanda ? "Velocidade da Luz" : "Super Rápido",
                description: isWakanda
                  ? "Processamento instantâneo com sincronização em tempo real"
                  : "Performance otimizada com sincronização instantânea",
              },
              {
                icon: Globe,
                title: isWakanda ? "Rede Global" : "Multi-plataforma",
                description: isWakanda
                  ? "Conectividade universal através de todas as plataformas e dispositivos"
                  : "Funciona perfeitamente em plataformas web, móvel e desktop",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`backdrop-blur-sm hover:scale-105 transition-all duration-300 ${
                  isWakanda
                    ? "bg-green-950/20 border-green-500/20 hover:bg-green-950/30 wakanda-border"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <CardHeader>
                  <feature.icon className={`h-12 w-12 mb-4 ${isWakanda ? "text-green-400" : "text-purple-400"}`} />
                  <CardTitle className={`text-xl ${isWakanda ? "text-green-100" : "text-white"}`}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-base ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integration" className={`py-20 px-6 ${isWakanda ? "bg-black/20 wakanda-geometric" : "bg-black/20"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                className={`mb-6 ${isWakanda ? "bg-green-600/20 text-green-300 border-green-500/30" : "bg-green-600/20 text-green-300 border-green-500/30"}`}
              >
                {isWakanda ? "Protocolo de Integração Avançado" : "Integração API Bling"}
              </Badge>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isWakanda ? "text-green-100" : "text-white"}`}>
                {isWakanda ? "Conexão Perfeita" : "Conexão ERP Perfeita"}
              </h2>
              <p className={`text-xl mb-8 ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                {isWakanda
                  ? "Nossa tecnologia se conecta diretamente com a API v3 do Bling, fornecendo sincronização instantânea com confiabilidade absoluta."
                  : "Nossa plataforma se integra diretamente com a API v3 do Bling, fornecendo sincronização em tempo real dos seus dados de estoque com confiabilidade empresarial."}
              </p>
              <div className="space-y-4">
                {[
                  "Autenticação OAuth2",
                  "Webhooks em Tempo Real",
                  "Sincronização Automática",
                  "Tratamento de Erros",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${isWakanda ? "bg-green-400" : "bg-purple-400"}`}></div>
                    <span className={isWakanda ? "text-green-100/80" : "text-white/80"}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div
                className={`rounded-2xl p-8 backdrop-blur-sm border ${
                  isWakanda
                    ? "bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/20 wakanda-glow"
                    : "bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-white/10"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isWakanda ? "bg-green-400" : "bg-green-400"}`}></div>
                    <span className={isWakanda ? "text-green-100/80" : "text-white/80"}>Conectado ao Bling</span>
                  </div>
                  <div className={`rounded-lg p-4 ${isWakanda ? "bg-black/30" : "bg-black/30"}`}>
                    <code className={`text-sm ${isWakanda ? "text-green-400" : "text-green-400"}`}>
                      {'{ "status": "connected", "products": 1247, "sync": "real-time" }'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isWakanda ? "text-green-100" : "text-white"}`}>
            {isWakanda ? "Pronto para o Futuro?" : "Pronto para Transformar Seu Negócio?"}
          </h2>
          <p className={`text-xl mb-8 ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
            {isWakanda
              ? "Junte-se à revolução tecnológica e transforme sua gestão de estoque com nossa plataforma avançada."
              : "Junte-se a milhares de empresas que já usam nossa plataforma para otimizar sua gestão de estoque."}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 px-6 ${isWakanda ? "border-green-500/20" : "border-white/10"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className={`text-2xl font-bold mb-4 ${isWakanda ? "text-green-400" : "text-white"}`}>
                Bling<span className={isWakanda ? "text-green-300" : "text-purple-400"}>Pro</span>
              </div>
              <p className={isWakanda ? "text-green-100/60" : "text-white/60"}>
                {isWakanda
                  ? "Tecnologia avançada para gestão de estoque."
                  : "Gestão premium de estoque com integração Bling."}
              </p>
            </div>
            <div>
              <h3 className={`font-semibold mb-4 ${isWakanda ? "text-green-100" : "text-white"}`}>Produto</h3>
              <div className="space-y-2"></div>
            </div>
            <div>
              <h3 className={`font-semibold mb-4 ${isWakanda ? "text-green-100" : "text-white"}`}>Suporte</h3>
              <div className="space-y-2"></div>
            </div>
            <div>
              <h3 className={`font-semibold mb-4 ${isWakanda ? "text-green-100" : "text-white"}`}>Empresa</h3>
              <div className="space-y-2"></div>
            </div>
          </div>
          <div
            className={`border-t mt-12 pt-8 text-center ${isWakanda ? "border-green-500/20 text-green-100/60" : "border-white/10 text-white/60"}`}
          >
            <p>&copy; 2025 BlingPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
