"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import type { DashboardData, RelatorioFiltros } from "@/types/analytics"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [relatorioData, setRelatorioData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    data_fim: new Date(),
    vendedor: "",
    situacao: "all",
  })

  useEffect(() => {
    loadDashboardData()
    loadRelatorioData()
  }, [])

  useEffect(() => {
    loadRelatorioData()
  }, [filtros])

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard")
      const data = await response.json()

      if (data.success) {
        setDashboardData(data.data)
      } else {
        toast.error("Erro ao carregar dados do dashboard")
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadRelatorioData = async () => {
    try {
      const params = new URLSearchParams()

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof Date) {
            params.append(key, value.toISOString().split("T")[0])
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/analytics/relatorios?${params}`)
      const data = await response.json()

      if (data.success) {
        setRelatorioData(data.data)
      } else {
        toast.error("Erro ao carregar relatório")
      }
    } catch (error) {
      toast.error("Erro ao carregar relatório")
      console.error(error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getSeveridadeBadge = (severidade: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      INFO: "outline",
      WARNING: "secondary",
      ERROR: "destructive",
      CRITICAL: "destructive",
    }

    return <Badge variant={variants[severidade] || "outline"}>{severidade}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Relatórios</h1>
          <p className="text-muted-foreground">Análise completa do seu negócio</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <>
              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardData.vendas_hoje)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
                    {dashboardData.crescimento_vendas >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardData.vendas_mes)}</div>
                    <p
                      className={`text-xs ${dashboardData.crescimento_vendas >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {dashboardData.crescimento_vendas >= 0 ? "+" : ""}
                      {dashboardData.crescimento_vendas}% vs mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.pedidos_pendentes}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.estoque_baixo}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Dia (Últimos 30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData.vendas_por_dia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="valor" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.top_produtos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="valor" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas Recentes */}
              {dashboardData.alertas_recentes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alertas Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.alertas_recentes.map((alerta) => (
                        <Alert key={alerta.id}>
                          <AlertDescription>
                            <div className="flex justify-between items-center">
                              <div>
                                <strong>{alerta.titulo}</strong>
                                <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                              </div>
                              {getSeveridadeBadge(alerta.severidade)}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filtros do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={filtros.data_inicio?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      setFiltros({ ...filtros, data_inicio: e.target.value ? new Date(e.target.value) : undefined })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={filtros.data_fim?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      setFiltros({ ...filtros, data_fim: e.target.value ? new Date(e.target.value) : undefined })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vendedor</Label>
                  <Input
                    placeholder="Nome do vendedor"
                    value={filtros.vendedor || ""}
                    onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Situação</Label>
                  <Select
                    value={filtros.situacao || "all"}
                    onValueChange={(value) => setFiltros({ ...filtros, situacao: value || "all" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as situações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as situações</SelectItem>
                      <SelectItem value="Em aberto">Em aberto</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Faturado">Faturado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relatório */}
          {relatorioData && (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total de Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioData.resumo.total_pedidos}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(relatorioData.resumo.total_vendas)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(relatorioData.resumo.ticket_medio)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Clientes Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioData.resumo.clientes_ativos}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Produtos Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioData.resumo.produtos_vendidos}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos do Relatório */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={relatorioData.vendas_por_mes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="vendas" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Vendedores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={relatorioData.top_vendedores.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="vendas" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="alertas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sistema de Alertas
              </CardTitle>
              <CardDescription>Monitore alertas e notificações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Sistema de alertas em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá configurar alertas personalizados</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
