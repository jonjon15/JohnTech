"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react"

interface EstoqueItem {
  id: number
  produto_id: number
  codigo: string
  nome: string
  categoria?: string
  deposito_nome: string
  quantidade_fisica: number
  quantidade_disponivel: number
  quantidade_reservada: number
  quantidade_minima: number
  custo_medio: number
  valor_estoque: number
  status_estoque: "NORMAL" | "BAIXO" | "ZERADO"
}

interface MovimentacaoEstoque {
  id: number
  data_movimentacao: string
  codigo: string
  produto_nome: string
  tipo: string
  operacao: "E" | "S"
  quantidade: number
  valor_unitario: number
  valor_total: number
  documento?: string
  observacoes?: string
  usuario?: string
}

interface RelatorioEstoque {
  resumo: {
    total_produtos: number
    produtos_baixo_estoque: number
    produtos_zerados: number
    valor_total_estoque: number
  }
  produtos: EstoqueItem[]
}

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [relatorio, setRelatorio] = useState<RelatorioEstoque | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  // Estados para movimentação
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<EstoqueItem | null>(null)
  const [tipoMovimentacao, setTipoMovimentacao] = useState<"entrada" | "saida">("entrada")
  const [formMovimentacao, setFormMovimentacao] = useState({
    quantidade: "",
    valor_unitario: "",
    documento: "",
    observacoes: "",
  })
  const [submittingMovimentacao, setSubmittingMovimentacao] = useState(false)

  useEffect(() => {
    loadEstoque()
    loadMovimentacoes()
    loadRelatorio()
  }, [])

  const loadEstoque = async () => {
    try {
      const response = await fetch("/api/estoque")
      const data = await response.json()

      if (data.success) {
        setEstoque(data.data)
      } else {
        toast.error("Erro ao carregar estoque")
      }
    } catch (error) {
      toast.error("Erro ao carregar estoque")
      console.error(error)
    }
  }

  const loadMovimentacoes = async () => {
    try {
      const response = await fetch("/api/estoque/movimentacao")
      const data = await response.json()

      if (data.success) {
        setMovimentacoes(data.data)
      } else {
        toast.error("Erro ao carregar movimentações")
      }
    } catch (error) {
      toast.error("Erro ao carregar movimentações")
      console.error(error)
    }
  }

  const loadRelatorio = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/estoque/relatorio?tipo=geral")
      const data = await response.json()

      if (data.success) {
        setRelatorio(data.data)
      } else {
        toast.error("Erro ao carregar relatório")
      }
    } catch (error) {
      toast.error("Erro ao carregar relatório")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!produtoSelecionado) return

    setSubmittingMovimentacao(true)

    try {
      const payload = {
        produto_id: produtoSelecionado.produto_id,
        tipo: tipoMovimentacao === "entrada" ? "Ajuste de Entrada" : "Ajuste de Saída",
        operacao: tipoMovimentacao === "entrada" ? "E" : "S",
        quantidade: Number.parseFloat(formMovimentacao.quantidade),
        valor_unitario: Number.parseFloat(formMovimentacao.valor_unitario) || 0,
        documento: formMovimentacao.documento,
        observacoes: formMovimentacao.observacoes,
        usuario: "Sistema",
      }

      const response = await fetch("/api/estoque/movimentacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Movimentação registrada com sucesso")
        setIsMovimentacaoOpen(false)
        setFormMovimentacao({
          quantidade: "",
          valor_unitario: "",
          documento: "",
          observacoes: "",
        })
        loadEstoque()
        loadMovimentacoes()
        loadRelatorio()
      } else {
        toast.error(data.error?.message || "Erro ao registrar movimentação")
      }
    } catch (error) {
      toast.error("Erro ao registrar movimentação")
      console.error(error)
    } finally {
      setSubmittingMovimentacao(false)
    }
  }

  const openMovimentacaoDialog = (produto: EstoqueItem, tipo: "entrada" | "saida") => {
    setProdutoSelecionado(produto)
    setTipoMovimentacao(tipo)
    setFormMovimentacao({
      quantidade: "",
      valor_unitario: produto.custo_medio.toString(),
      documento: "",
      observacoes: "",
    })
    setIsMovimentacaoOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      NORMAL: "default",
      BAIXO: "secondary",
      ZERADO: "destructive",
    }

    const labels: Record<string, string> = {
      NORMAL: "Normal",
      BAIXO: "Baixo",
      ZERADO: "Zerado",
    }

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  const filteredEstoque = estoque.filter((item) => {
    const matchesSearch =
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filtroStatus === "todos" || item.status_estoque === filtroStatus.toUpperCase()

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gerencie seu estoque e movimentações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRelatorio}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {relatorio && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relatorio.resumo.total_produtos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{relatorio.resumo.produtos_baixo_estoque}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Zerados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{relatorio.resumo.produtos_zerados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(relatorio.resumo.valor_total_estoque)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="estoque" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estoque">Estoque Atual</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buscar produto</Label>
                  <Input
                    placeholder="Código ou nome do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status do estoque</Label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="zerado">Zerado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos em Estoque ({filteredEstoque.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEstoque.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Disponível</TableHead>
                      <TableHead>Reservado</TableHead>
                      <TableHead>Mínimo</TableHead>
                      <TableHead>Custo Médio</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEstoque.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            <div className="text-sm text-muted-foreground font-mono">{item.codigo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.categoria || "-"}</TableCell>
                        <TableCell className="font-mono">{item.quantidade_disponivel}</TableCell>
                        <TableCell className="font-mono">{item.quantidade_reservada}</TableCell>
                        <TableCell className="font-mono">{item.quantidade_minima}</TableCell>
                        <TableCell>{formatCurrency(item.custo_medio)}</TableCell>
                        <TableCell>{formatCurrency(item.valor_estoque)}</TableCell>
                        <TableCell>{getStatusBadge(item.status_estoque)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => openMovimentacaoDialog(item, "entrada")}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openMovimentacaoDialog(item, "saida")}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {movimentacoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhuma movimentação encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Documento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.slice(0, 50).map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>{formatDate(mov.data_movimentacao)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{mov.produto_nome}</div>
                            <div className="text-sm text-muted-foreground font-mono">{mov.codigo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{mov.tipo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {mov.operacao === "E" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            {mov.operacao === "E" ? "Entrada" : "Saída"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{mov.quantidade}</TableCell>
                        <TableCell>{formatCurrency(mov.valor_unitario)}</TableCell>
                        <TableCell>{formatCurrency(mov.valor_total)}</TableCell>
                        <TableCell>{mov.documento || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Movimentação */}
      <Dialog open={isMovimentacaoOpen} onOpenChange={setIsMovimentacaoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tipoMovimentacao === "entrada" ? "Entrada" : "Saída"} de Estoque</DialogTitle>
            <DialogDescription>
              {produtoSelecionado && (
                <>
                  Produto: {produtoSelecionado.nome} ({produtoSelecionado.codigo})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleMovimentacao} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={formMovimentacao.quantidade}
                  onChange={(e) => setFormMovimentacao((prev) => ({ ...prev, quantidade: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_unitario">Valor Unitário</Label>
                <Input
                  id="valor_unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formMovimentacao.valor_unitario}
                  onChange={(e) => setFormMovimentacao((prev) => ({ ...prev, valor_unitario: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                value={formMovimentacao.documento}
                onChange={(e) => setFormMovimentacao((prev) => ({ ...prev, documento: e.target.value }))}
                placeholder="Número do documento (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formMovimentacao.observacoes}
                onChange={(e) => setFormMovimentacao((prev) => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações (opcional)"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMovimentacaoOpen(false)}
                disabled={submittingMovimentacao}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submittingMovimentacao}>
                {submittingMovimentacao && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmar {tipoMovimentacao === "entrada" ? "Entrada" : "Saída"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
