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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  RefreshCw,
  AlertTriangle,
  Database,
  Webhook,
  Key,
} from "lucide-react"

interface Produto {
  id: number
  bling_id?: number
  nome: string
  codigo: string
  preco: number
  descricao: string
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
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    descricao: "",
    situacao: "Ativo",
    tipo: "P",
    formato: "S",
  })

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bling/homologacao/produtos")
      const data = await response.json()

      if (data.success) {
        setProdutos(data.data.data || [])
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setIsTestRunning(true)
    setTestResults([])

    const tests = [
      { name: "Conexão com Banco", test: testDatabase },
      { name: "Token OAuth", test: testOAuthToken },
      { name: "Listar Produtos", test: testListProducts },
      { name: "Criar Produto", test: testCreateProduct },
      { name: "Atualizar Produto", test: testUpdateProduct },
      { name: "Deletar Produto", test: testDeleteProduct },
      { name: "Webhook Endpoint", test: testWebhookEndpoint },
    ]

    for (const { name, test } of tests) {
      try {
        setTestResults((prev) => [...prev, { name, status: "pending", message: "Executando..." }])

        const result = await test()

        setTestResults((prev) =>
          prev.map((t) =>
            t.name === name ? { ...t, status: "success", message: result.message, details: result.details } : t,
          ),
        )
      } catch (error: any) {
        setTestResults((prev) =>
          prev.map((t) =>
            t.name === name ? { ...t, status: "error", message: error.message, details: error.details } : t,
          ),
        )
      }
    }

    setIsTestRunning(false)
  }

  const testDatabase = async () => {
    const response = await fetch("/api/db/status")
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Erro na conexão com banco")
    }

    return { message: "Conexão com banco OK", details: data }
  }

  const testOAuthToken = async () => {
    const response = await fetch("/api/auth/bling/status")
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Token OAuth inválido")
    }

    return { message: "Token OAuth válido", details: data }
  }

  const testListProducts = async () => {
    const response = await fetch("/api/bling/homologacao/produtos")
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || "Erro ao listar produtos")
    }

    return {
      message: `${data.data.data.length} produtos encontrados`,
      details: data.data,
    }
  }

  const testCreateProduct = async () => {
    const testProduct = {
      nome: `Produto Teste ${Date.now()}`,
      codigo: `TEST-${Date.now()}`,
      preco: 99.99,
      descricao: "Produto criado durante teste de homologação",
      situacao: "Ativo",
    }

    const response = await fetch("/api/bling/homologacao/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testProduct),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || "Erro ao criar produto")
    }

    return {
      message: "Produto criado com sucesso",
      details: data.data,
    }
  }

  const testUpdateProduct = async () => {
    // Usar o primeiro produto da lista para teste
    if (produtos.length === 0) {
      throw new Error("Nenhum produto disponível para teste")
    }

    const produto = produtos[0]
    const updatedData = {
      ...produto,
      descricao: `Atualizado em ${new Date().toISOString()}`,
    }

    const response = await fetch(`/api/bling/homologacao/produtos/${produto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || "Erro ao atualizar produto")
    }

    return {
      message: "Produto atualizado com sucesso",
      details: data.data,
    }
  }

  const testDeleteProduct = async () => {
    // Criar um produto temporário para deletar
    const tempProduct = {
      nome: `Produto Temp ${Date.now()}`,
      codigo: `TEMP-${Date.now()}`,
      preco: 1.0,
      descricao: "Produto temporário para teste de deleção",
    }

    const createResponse = await fetch("/api/bling/homologacao/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tempProduct),
    })

    const createData = await createResponse.json()

    if (!createData.success) {
      throw new Error("Erro ao criar produto temporário")
    }

    const deleteResponse = await fetch(`/api/bling/homologacao/produtos/${createData.data.data.id}`, {
      method: "DELETE",
    })

    const deleteData = await deleteResponse.json()

    if (!deleteData.success) {
      throw new Error(deleteData.error?.message || "Erro ao deletar produto")
    }

    return {
      message: "Produto deletado com sucesso",
      details: deleteData.data,
    }
  }

  const testWebhookEndpoint = async () => {
    const response = await fetch("/api/bling/webhooks")
    const data = await response.json()

    if (!response.ok) {
      throw new Error("Endpoint de webhook não está funcionando")
    }

    return {
      message: "Endpoint de webhook ativo",
      details: data,
    }
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
          preco: Number.parseFloat(formData.preco) || 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadProdutos()
        setIsDialogOpen(false)
        resetForm()
      } else {
        alert(data.error?.message || "Erro ao salvar produto")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao salvar produto")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (produto: Produto) => {
    setEditingProduct(produto)
    setFormData({
      nome: produto.nome,
      codigo: produto.codigo,
      preco: produto.preco.toString(),
      descricao: produto.descricao,
      situacao: produto.situacao,
      tipo: produto.tipo,
      formato: produto.formato,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        await loadProdutos()
      } else {
        alert(data.error?.message || "Erro ao deletar produto")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao deletar produto")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      preco: "",
      descricao: "",
      situacao: "Ativo",
      tipo: "P",
      formato: "S",
    })
    setEditingProduct(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homologação Bling API</h1>
          <p className="text-muted-foreground">Testes e validação da integração com a API do Bling</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Database className="h-4 w-4 mr-2" />
          Ambiente de Homologação
        </Badge>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Testes Automatizados</TabsTrigger>
          <TabsTrigger value="products">Gerenciar Produtos</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Testes de Homologação
              </CardTitle>
              <CardDescription>
                Execute todos os testes necessários para validar a integração com o Bling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runAllTests} disabled={isTestRunning} className="w-full">
                {isTestRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando Testes...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Todos os Testes
                  </>
                )}
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Resultados dos Testes:</h3>
                  {testResults.map((result, index) => (
                    <Alert
                      key={index}
                      className={
                        result.status === "success"
                          ? "border-green-200 bg-green-50"
                          : result.status === "error"
                            ? "border-red-200 bg-red-50"
                            : "border-yellow-200 bg-yellow-50"
                      }
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <AlertDescription>
                          <strong>{result.name}:</strong> {result.message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produtos de Homologação</CardTitle>
                  <CardDescription>Gerencie produtos para testes da API</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                      <DialogDescription>Preencha os dados do produto para homologação</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="codigo">Código *</Label>
                          <Input
                            id="codigo"
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="preco">Preço</Label>
                          <Input
                            id="preco"
                            type="number"
                            step="0.01"
                            value={formData.preco}
                            onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                          />
                        </div>
                        <div>
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
                        <div>
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
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={loadProdutos} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                <Badge variant="secondary">{produtos.length} produtos</Badge>
              </div>

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
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>{produto.id}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>{produto.codigo}</TableCell>
                      <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={produto.situacao === "Ativo" ? "default" : "secondary"}>
                          {produto.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(produto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(produto.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Configuração de Webhooks
              </CardTitle>
              <CardDescription>Configure e teste os webhooks do Bling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>URL do Webhook:</strong> {process.env.NEXT_PUBLIC_BASE_URL}/api/bling/webhooks
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Eventos Suportados:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline">produto.criado</Badge>
                  <Badge variant="outline">produto.atualizado</Badge>
                  <Badge variant="outline">produto.excluido</Badge>
                  <Badge variant="outline">pedido.criado</Badge>
                  <Badge variant="outline">pedido.atualizado</Badge>
                  <Badge variant="outline">estoque.atualizado</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Webhook className="h-4 w-4 mr-2" />
                Testar Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
