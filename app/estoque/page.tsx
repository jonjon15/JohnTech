"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  ArrowUpDown,
  BarChart3,
  Warehouse,
  History,
  AlertCircle,
} from "lucide-react"

interface EstoqueItem {
  id: number
  produto_id: number
  produto_nome: string
  produto_codigo: string
  deposito_id: number
  deposito_nome: string
  quantidade_fisica: number
  quantidade_virtual: number
  quantidade_disponivel: number
  quantidade_minima: number
  custo_medio: number
  valor_total: number
}

interface Deposito {
  id: number
  nome: string
  descricao: string
  ativo: boolean
  padrao: boolean
}

interface MovimentacaoEstoque {
  id: number
  produto_nome: string
  produto_codigo: string
  deposito_nome: string
  tipo_movimentacao: string
  quantidade: number
  quantidade_anterior: number
  quantidade_nova: number
  motivo: string
  created_at: string
}

interface AlertaEstoque {
  id: number
  produto_nome: string
  produto_codigo: string
  deposito_nome: string
  tipo_alerta: string
  quantidade_atual: number
  quantidade_minima: number
  data_alerta: string
}

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    produto: "",
    deposito: "",
    estoqueMinimo: false,
    estoqueZerado: false,
  })

  // Estados para movimentação
  const [movimentacaoDialog, setMovimentacaoDialog] = useState(false)
  const [movimentacaoForm, setMovimentacaoForm] = useState({
    produto_id: "",
    deposito_id: "",
    tipo_movimentacao: "",
    quantidade: "",
    custo_unitario: "",
    motivo: "",
    observacoes: "",
  })

  const loadEstoque = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.produto) params.set("produto", filtros.produto)
      if (filtros.deposito) params.set("deposito", filtros.deposito)
      if (filtros.estoqueMinimo) params.set("estoque_minimo", "true")
      if (filtros.estoqueZerado) params.set("estoque_zerado", "true")

      const response = await fetch(`/api/estoque?${params}`)
      const data = await response.json()

      if (data.success) {
        setEstoque(data.data)
      } else {
        toast({
          title: "Erro ao carregar estoque",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDepositos = async () => {
    try {
      const response = await fetch("/api/estoque/depositos")
      const data = await response.json()
      if (data.success) {
        setDepositos(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar depósitos:", error)
    }
  }

  const loadMovimentacoes = async () => {
    try {
      const response = await fetch("/api/estoque/movimentacao?limit=20")
      const data = await response.json()
      if (data.success) {
        setMovimentacoes(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error)
    }
  }

  const loadAlertas = async () => {
    try {
      const response = await fetch("/api/estoque/alertas")
      const data = await response.json()
      if (data.success) {
        setAlertas(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar alertas:", error)
    }
  }

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/estoque/movimentacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...movimentacaoForm,
          produto_id: Number.parseInt(movimentacaoForm.produto_id),
          deposito_id: Number.parseInt(movimentacaoForm.deposito_id),
          quantidade: Number.parseFloat(movimentacaoForm.quantidade),
          custo_unitario: Number.parseFloat(movimentacaoForm.custo_unitario) || 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Movimentação realizada",
          description: "Estoque atualizado com sucesso",
        })
        setMovimentacaoDialog(false)
        setMovimentacaoForm({
          produto_id: "",
          deposito_id: "",
          tipo_movimentacao: "",
          quantidade: "",
          custo_unitario: "",
          motivo: "",
          observacoes: "",
        })
        loadEstoque()
        loadMovimentacoes()
      } else {
        toast({
          title: "Erro na movimentação",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sincronizarEstoque = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bling/sync/estoque", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sincronização concluída",
          description: data.message,
        })
        loadEstoque()
      } else {
        toast({
          title: "Erro na sincronização",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na sincronização",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (item: EstoqueItem) => {
    if (item.quantidade_disponivel < 0) {
      return <Badge variant="destructive">Negativo</Badge>
    }
    if (item.quantidade_disponivel === 0) {
      return <Badge variant="secondary">Zerado</Badge>
    }
    if (item.quantidade_disponivel <= item.quantidade_minima) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          Baixo
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-green-600">
        OK
      </Badge>
    )
  }

  const getTipoMovimentacaoIcon = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA":
        return <Plus className="h-4 w-4 text-green-600" />
      case "SAIDA":
        return <Minus className="h-4 w-4 text-red-600" />
      case "TRANSFERENCIA":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  useEffect(() => {
    loadEstoque()
    loadDepositos()
    loadMovimentacoes()
    loadAlertas()
  }, [])

  useEffect(() => {
    loadEstoque()
  }, [filtros])

  const stats = {
    totalItens: estoque.length,
    valorTotal: estoque.reduce((sum, item) => sum + item.valor_total, 0),
    itensComEstoque: estoque.filter((item) => item.quantidade_disponivel > 0).length,
    itensEstoqueBaixo: estoque.filter(
      (item) => item.quantidade_disponivel <= item.quantidade_minima && item.quantidade_disponivel > 0,
    ).length,
    itensZerados: estoque.filter((item) => item.quantidade_disponivel === 0).length,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gestão completa do estoque integrado com Bling</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sincronizarEstoque} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Sincronizar Bling
          </Button>
          <Dialog open={movimentacaoDialog} onOpenChange={setMovimentacaoDialog}>
            <DialogTrigger asChild>
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMovimentacao} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select
                    value={movimentacaoForm.produto_id}
                    onValueChange={(value) => setMovimentacaoForm({ ...movimentacaoForm, produto_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {estoque.map((item) => (
                        <SelectItem key={item.produto_id} value={item.produto_id.toString()}>
                          {item.produto_nome} ({item.produto_codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Depósito</Label>
                  <Select
                    value={movimentacaoForm.deposito_id}
                    onValueChange={(value) => setMovimentacaoForm({ ...movimentacaoForm, deposito_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o depósito" />
                    </SelectTrigger>
                    <SelectContent>
                      {depositos.map((deposito) => (
                        <SelectItem key={deposito.id} value={deposito.id.toString()}>
                          {deposito.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Movimentação</Label>
                  <Select
                    value={movimentacaoForm.tipo_movimentacao}
                    onValueChange={(value) => setMovimentacaoForm({ ...movimentacaoForm, tipo_movimentacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRADA">Entrada</SelectItem>
                      <SelectItem value="SAIDA">Saída</SelectItem>
                      <SelectItem value="AJUSTE">Ajuste</SelectItem>
                      <SelectItem value="INVENTARIO">Inventário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={movimentacaoForm.quantidade}
                    onChange={(e) => setMovimentacaoForm({ ...movimentacaoForm, quantidade: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Unitário</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={movimentacaoForm.custo_unitario}
                    onChange={(e) => setMovimentacaoForm({ ...movimentacaoForm, custo_unitario: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Input
                    value={movimentacaoForm.motivo}
                    onChange={(e) => setMovimentacaoForm({ ...movimentacaoForm, motivo: e.target.value })}
                    placeholder="Ex: Venda, Compra, Ajuste..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setMovimentacaoDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Processando..." : "Confirmar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItens}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.itensComEstoque}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.itensEstoqueBaixo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zerados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.itensZerados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você tem {alertas.length} alerta(s) de estoque pendente(s). Verifique a aba "Alertas" para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="estoque" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="alertas">Alertas ({alertas.length})</TabsTrigger>
          <TabsTrigger value="depositos">Depósitos</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Input
                    placeholder="Nome do produto..."
                    value={filtros.produto}
                    onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Depósito</Label>
                  <Select
                    value={filtros.deposito}
                    onValueChange={(value) => setFiltros({ ...filtros, deposito: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os depósitos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os depósitos</SelectItem>
                      {depositos.map((deposito) => (
                        <SelectItem key={deposito.id} value={deposito.id.toString()}>
                          {deposito.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="estoque-minimo"
                    checked={filtros.estoqueMinimo}
                    onChange={(e) => setFiltros({ ...filtros, estoqueMinimo: e.target.checked })}
                  />
                  <Label htmlFor="estoque-minimo">Apenas estoque baixo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="estoque-zerado"
                    checked={filtros.estoqueZerado}
                    onChange={(e) => setFiltros({ ...filtros, estoqueZerado: e.target.checked })}
                  />
                  <Label htmlFor="estoque-zerado">Apenas zerados</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>Itens em Estoque</CardTitle>
              <CardDescription>{estoque.length} itens encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Depósito</TableHead>
                    <TableHead>Disponível</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Custo Médio</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estoque.map((item) => (
                    <TableRow key={`${item.produto_id}-${item.deposito_id}`}>
                      <TableCell className="font-medium">{item.produto_nome}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{item.produto_codigo}</code>
                      </TableCell>
                      <TableCell>{item.deposito_nome}</TableCell>
                      <TableCell>{item.quantidade_disponivel.toFixed(3)}</TableCell>
                      <TableCell>{item.quantidade_minima?.toFixed(3) || "-"}</TableCell>
                      <TableCell>R$ {item.custo_medio.toFixed(2)}</TableCell>
                      <TableCell>R$ {item.valor_total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                    </TableRow>
                  ))}
                  {estoque.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum item encontrado
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Últimas Movimentações
              </CardTitle>
              <CardDescription>Histórico das 20 últimas movimentações de estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Depósito</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Anterior</TableHead>
                    <TableHead>Nova</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{new Date(mov.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTipoMovimentacaoIcon(mov.tipo_movimentacao)}
                          {mov.tipo_movimentacao}
                        </div>
                      </TableCell>
                      <TableCell>
                        {mov.produto_nome} ({mov.produto_codigo})
                      </TableCell>
                      <TableCell>{mov.deposito_nome}</TableCell>
                      <TableCell>{mov.quantidade.toFixed(3)}</TableCell>
                      <TableCell>{mov.quantidade_anterior.toFixed(3)}</TableCell>
                      <TableCell>{mov.quantidade_nova.toFixed(3)}</TableCell>
                      <TableCell>{mov.motivo || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {movimentacoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma movimentação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Estoque
              </CardTitle>
              <CardDescription>Produtos que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              {alertas.length > 0 ? (
                <div className="space-y-4">
                  {alertas.map((alerta) => (
                    <Alert key={alerta.id} className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <div>
                            <strong>
                              {alerta.produto_nome} ({alerta.produto_codigo})
                            </strong>{" "}
                            - {alerta.deposito_nome}
                            <br />
                            <span className="text-sm text-muted-foreground">
                              {alerta.tipo_alerta === "ESTOQUE_BAIXO" && "Estoque baixo: "}
                              {alerta.tipo_alerta === "ESTOQUE_ZERADO" && "Estoque zerado: "}
                              {alerta.tipo_alerta === "ESTOQUE_NEGATIVO" && "Estoque negativo: "}
                              {alerta.quantidade_atual} unidades
                              {alerta.tipo_alerta === "ESTOQUE_BAIXO" && ` (mínimo: ${alerta.quantidade_minima})`}
                            </span>
                          </div>
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            {alerta.tipo_alerta.replace("_", " ")}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p>Nenhum alerta de estoque no momento</p>
                  <p className="text-sm">Todos os produtos estão com estoque adequado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depositos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Depósitos
              </CardTitle>
              <CardDescription>Gerenciar depósitos de estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Padrão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depositos.map((deposito) => (
                    <TableRow key={deposito.id}>
                      <TableCell className="font-medium">{deposito.nome}</TableCell>
                      <TableCell>{deposito.descricao || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={deposito.ativo ? "default" : "secondary"}>
                          {deposito.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deposito.padrao && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600">
                            Padrão
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {depositos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum depósito cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
