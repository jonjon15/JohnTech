"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { Pedido, PedidoStats, PedidoFilters } from "../../types/pedidos"

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [stats, setStats] = useState<PedidoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PedidoFilters>({
    page: 1,
    limit: 50,
    situacao: "all", // Updated default value for situacao
  })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadPedidos()
    loadStats()
  }, [filters])

  const loadPedidos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/pedidos?${params}`)
      const data = await response.json()

      if (data.success) {
        setPedidos(data.data.pedidos)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      } else {
        toast.error(data.error || "Erro ao carregar pedidos")
      }
    } catch (error) {
      toast.error("Erro ao carregar pedidos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/pedidos/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getSituacaoBadge = (situacao: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Em aberto": "outline",
      Confirmado: "secondary",
      Faturado: "default",
      Cancelado: "destructive",
    }

    return <Badge variant={variants[situacao] || "outline"}>{situacao}</Badge>
  }

  const handleFilterChange = (key: keyof PedidoFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset para primeira página ao filtrar
    }))
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      situacao: "all", // Updated default value for situacao
    })
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pedidos de Venda</h1>
          <p className="text-muted-foreground">Gerencie seus pedidos de venda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Novo Pedido</DialogTitle>
                <DialogDescription>Crie um novo pedido de venda</DialogDescription>
              </DialogHeader>
              {/* Formulário de criação de pedido seria implementado aqui */}
              <div className="p-4 text-center text-muted-foreground">
                Formulário de criação de pedido em desenvolvimento
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_pedidos}</div>
              <p className="text-xs text-muted-foreground">{stats.pedidos_em_aberto} em aberto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_vendas)}</div>
              <p className="text-xs text-muted-foreground">Ticket médio: {formatCurrency(stats.ticket_medio)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
              {stats.crescimento_percentual >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.vendas_mes_atual)}</div>
              <p className={`text-xs ${stats.crescimento_percentual >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.crescimento_percentual >= 0 ? "+" : ""}
                {stats.crescimento_percentual}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status dos Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pedidos_faturados}</div>
              <p className="text-xs text-muted-foreground">{stats.pedidos_cancelados} cancelados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <Select value={filters.situacao} onValueChange={(value) => handleFilterChange("situacao", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="vendedor">Vendedor</Label>
              <Input
                id="vendedor"
                placeholder="Nome do vendedor"
                value={filters.vendedor || ""}
                onChange={(e) => handleFilterChange("vendedor", e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filters.data_inicio ? filters.data_inicio.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  handleFilterChange("data_inicio", e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filters.data_fim ? filters.data_fim.toISOString().split("T")[0] : ""}
                onChange={(e) => handleFilterChange("data_fim", e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={loadPedidos} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({total})</CardTitle>
          <CardDescription>
            Página {filters.page} de {totalPages} - {total} pedidos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou criar um novo pedido</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">{pedido.numero || `#${pedido.id}`}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pedido.cliente?.nome}</div>
                          <div className="text-sm text-muted-foreground">{pedido.cliente?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(pedido.data_pedido)}</TableCell>
                      <TableCell>{getSituacaoBadge(pedido.situacao)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(pedido.total_geral)}</TableCell>
                      <TableCell>{pedido.vendedor || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => handlePageChange(filters.page! - 1)}
                  >
                    Anterior
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    disabled={filters.page === totalPages}
                    onClick={() => handlePageChange(filters.page! + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
