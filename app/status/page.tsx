"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Activity, Database, Webhook } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface ServiceStatus {
  name: string
  status: "online" | "offline" | "degraded"
  responseTime?: number
  lastCheck: Date
  error?: string
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"

  const checkServices = async () => {
    setIsChecking(true)

    const servicesToCheck = [
      { name: "Bling API", endpoint: "/api/bling/status" },
      { name: "Autenticação OAuth", endpoint: "/api/auth/bling/status" },
      { name: "Webhooks", endpoint: "/api/bling/webhooks/status" },
      { name: "Banco de Dados", endpoint: "/api/db/status" },
    ]

    const results: ServiceStatus[] = []

    for (const service of servicesToCheck) {
      try {
        const startTime = Date.now()
        const response = await fetch(service.endpoint)
        const responseTime = Date.now() - startTime

        results.push({
          name: service.name,
          status: response.ok ? "online" : "degraded",
          responseTime,
          lastCheck: new Date(),
          error: response.ok ? undefined : `HTTP ${response.status}`,
        })
      } catch (error) {
        results.push({
          name: service.name,
          status: "offline",
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    setServices(results)
    setIsChecking(false)
  }

  useEffect(() => {
    checkServices()
    const interval = setInterval(checkServices, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    const variants = {
      online: "bg-green-500/20 text-green-400 border-green-500/30",
      degraded: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      offline: "bg-red-500/20 text-red-400 border-red-500/30",
    }

    const labels = {
      online: "Online",
      degraded: "Degradado",
      offline: "Offline",
    }

    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div
      className={`min-h-screen pt-20 ${isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"}`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isWakanda ? "text-green-100" : "text-white"}`}>Status do Sistema</h1>
            <p className={`${isWakanda ? "text-green-100/70" : "text-white/70"} mt-2`}>
              Monitoramento em tempo real dos serviços BlingPro
            </p>
          </div>
          <Button
            onClick={checkServices}
            disabled={isChecking}
            className={`${isWakanda ? "bg-green-600 hover:bg-green-700 text-black font-semibold wakanda-glow" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {isChecking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
            {isChecking ? "Verificando..." : "Atualizar Status"}
          </Button>
        </div>

        <div className="grid gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`backdrop-blur-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"}`}>{service.name}</CardTitle>
                      <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                        Última verificação: {service.lastCheck.toLocaleTimeString()}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {service.responseTime && (
                      <p className={`text-sm ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                        Tempo de resposta: {service.responseTime}ms
                      </p>
                    )}
                    {service.error && <p className="text-sm text-red-400">Erro: {service.error}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {service.name.includes("Banco") && <Database className="h-4 w-4 text-gray-400" />}
                    {service.name.includes("Webhook") && <Webhook className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card
          className={`mt-8 ${isWakanda ? "bg-green-600/10 border-green-500/30" : "bg-blue-600/10 border-blue-500/30"}`}
        >
          <CardHeader>
            <CardTitle className={`${isWakanda ? "text-green-300" : "text-blue-300"}`}>
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${isWakanda ? "text-green-100/70" : "text-blue-100/70"}`}>Versão da API</p>
                <p className={`font-semibold ${isWakanda ? "text-green-200" : "text-blue-200"}`}>v3.0</p>
              </div>
              <div>
                <p className={`text-sm ${isWakanda ? "text-green-100/70" : "text-blue-100/70"}`}>Ambiente</p>
                <p className={`font-semibold ${isWakanda ? "text-green-200" : "text-blue-200"}`}>
                  {process.env.NODE_ENV === "production" ? "Produção" : "Desenvolvimento"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isWakanda ? "text-green-100/70" : "text-blue-100/70"}`}>Região</p>
                <p className={`font-semibold ${isWakanda ? "text-green-200" : "text-blue-200"}`}>Brasil</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
