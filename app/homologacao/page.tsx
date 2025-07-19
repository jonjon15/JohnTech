"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, Plus, Edit, Trash2, RefreshCw, TestTube } from "lucide-react"

// ——— util para fazer parse seguro de JSON ———
async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      return (await res.json()) as T
    }
    const text = await res.text()
    console.warn("Resposta não era JSON, mas foi lida como texto:", text)
    return null
  } catch (e) {
    console.error("Falha ao fazer parse do JSON:", e)
    return null
  }
}

interface Product {
  id: number
  bling_id?: number
  nome: string
  codigo: string
  preco: number
  descricao_curta?: string
  situacao: string
  tipo: string
  formato: string
  created_at: string
  updated_at: string
}

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  details?: any
}

export default function HomologacaoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    descricao_curta: "",
    situacao: "Ativo",
    tipo: "P",
    formato: "S",
  })

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      preco: "",
      descricao_curta: "",
      situacao: "Ativo",
      tipo: "P",
      formato: "S",
    })
    setEditingProduct(null)
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bling/homologacao/produtos")

      if (!response.ok) {
        const text = await response.text()
        console.error("Resposta não-OK ao listar produtos:", text.slice(0, 300))
        throw new Error(`Erro ${response.status} ao listar produtos`)
      }

      const data = await safeJson<{ success: boolean; data?: any; error?: any }>(response)

      if (data?.success) {
        setProducts(data.data?.produtos || [])
      } else {
        throw new Error(data?.error?.message || "Falha desconhecida ao carregar produtos")
      }
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error)
      toast({
        title: "Não foi possível carregar produtos",
        description: error.message ?? "Erro inesperado",
        variant: "destructive",
      })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    // A lógica de testes pode ser mantida ou simplificada conforme necessário.
    // Por enquanto, vamos focar no CRUD.
    toast({ title: "Funcionalidade de Testes", description: "A ser implementada." })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct
        ? `/api/bling/homologacao/produtos/${editingProduct.id}`
        : "/api/bling/homologacao/produtos"

      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          preco: formData.preco ? Number.parseFloat(formData.preco) : 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: editingProduct ? "Produto atualizado" : "Produto criado",
          description: "Operação realizada com sucesso",
        })
        resetForm()
        setIsDialogOpen(false)
        await loadProducts()
      } else {
        toast({
          title: "Erro",
          description: data.error?.message || "Erro desconhecido",
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nome: product.nome,
      codigo: product.codigo,
      preco: product.preco.toString(),
      descricao_curta: product.descricao_curta || "",
      situacao: product.situacao,
      tipo: product.tipo,
      formato: product.formato,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja deletar o produto "${product.nome}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${product.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Produto deletado",
          description: "Produto removido com sucesso",
        })
        await loadProducts()
      } else {
        toast({
          title: "Erro ao deletar",
          description: data.error?.message || "Erro desconhecido",
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

  const getStatusIcon = (status: "success" | "error" | "pending") => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homologação Bling API</h1>
          <p className="text-muted-foreground">Teste e valide a integração com a API do Bling</p>
        </div>
        <Button onClick={runAllTests} disabled={isTestingAll} className="gap-2">
          <TestTube className="h-4 w-4" />
          {isTestingAll ? "Executando..." : "Executar Todos os Testes"}
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests">Testes Automatizados</TabsTrigger>
          <TabsTrigger value="products">Gerenciar Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Resultados dos Testes
              </CardTitle>
              <CardDescription>Status da integração com a API do Bling</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  A funcionalidade de testes automatizados será implementada em uma próxima etapa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Produtos de Homologação</h2>
            <div className="flex gap-2">
              <Button onClick={loadProducts} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="ml-2">Atualizar</span>
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao_curta">Descrição</Label>
                      <Textarea
                        id="descricao_curta"
                        value={formData.descricao_curta}
                        onChange={(e) => setFormData({ ...formData, descricao_curta: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="situacao">Situação</Label>
                        <Select
                          value={formData.situacao}
                          onValueChange={(value) => setFormData({ ...formData, situacao: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="P">Produto</SelectItem>
                            <SelectItem value="S">Serviço</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="formato">Formato</Label>
                        <Select
                          value={formData.formato}
                          onValueChange={(value) => setFormData({ ...formData, formato: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">Simples</SelectItem>
                            <SelectItem value="V">Variação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell className="font-medium">{product.nome}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">{product.codigo}</code>
                        </TableCell>
                        <TableCell>
                          {typeof product.preco === "number" ? `R$ ${product.preco.toFixed(2)}` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.situacao === "Ativo" ? "default" : "secondary"}>
                            {product.situacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(product)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {loading ? <RefreshCw className="h-6 w-6 animate-spin mx-auto" /> : "Nenhum produto encontrado"}
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
