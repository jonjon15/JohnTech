"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Database,
  Cloud,
  Webhook,
  Activity,
  FileText,
  Settings,
} from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  bling_id?: number
  nome: string
  codigo: string
  preco: number
  descricao?: string
  situacao: "Ativo" | "Inativo"
  created_at: string
  updated_at: string
}

interface HomologationData {
  local_products: {
    count: number
    total: number
    items: Product[]
  }
  bling_products: {
    count: number
    items: any[]
    error: string | null
  }
  database: {
    connection_ok: boolean
    tables_exist: boolean
  }
  api: {
    bling_connected: boolean
    token_valid: boolean
  }
  pagination: {
    current_page: number
    per_page: number
    total_pages: number
    total_items: number
  }
}

interface TestResult {
  name: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  duration?: number
}

export default function HomologacaoPage() {
  const [data, setData] = useState<HomologationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    descricao: "",
  })

  // Estados para testes de homologação
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: "GET - Listar produtos", status: "pending" },
    { name: "POST - Criar produto", status: "pending" },
    { name: "PUT - Atualizar produto", status: "pending" },
    { name: "DELETE - Remover produto", status: "pending" },
    { name: "PATCH - Alterar situação", status: "pending" },
    { name: "Webhooks - Receber eventos", status: "pending" },
  ])
  const [testProgress, setTestProgress] = useState(0)
  const [isRunningTests, setIsRunningTests] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/bling/homologacao/produtos")
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error?.message || "Erro ao carregar dados")
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async () => {
    try {
      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
        body: JSON.stringify({
          nome: formData.nome,
          codigo: formData.codigo,
          preco: Number.parseFloat(formData.preco) || 0,
          descricao: formData.descricao,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Produto criado com sucesso!")
        setIsCreateDialogOpen(false)
        setFormData({ nome: "", codigo: "", preco: "", descricao: "" })
        await loadData()
      } else {
        toast.error(result.error?.message || "Erro ao criar produto")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar produto")
    }
  }

  const updateProduct = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
        body: JSON.stringify({
          nome: formData.nome,
          codigo: formData.codigo,
          preco: Number.parseFloat(formData.preco) || 0,
          descricao: formData.descricao,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Produto atualizado com sucesso!")
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        setFormData({ nome: "", codigo: "", preco: "", descricao: "" })
        await loadData()
      } else {
        toast.error(result.error?.message || "Erro ao atualizar produto")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar produto")
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "DELETE",
        headers: {
          "x-bling-homologacao": "true",
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Produto excluído com sucesso!")
        await loadData()
      } else {
        toast.error(result.error?.message || "Erro ao excluir produto")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir produto")
    }
  }

  const toggleProductStatus = async (product: Product) => {
    const newStatus = product.situacao === "Ativo" ? "I" : "A"

    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
        body: JSON.stringify({ situacao: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Produto ${newStatus === "A" ? "ativado" : "inativado"} com sucesso!`)
        await loadData()
      } else {
        toast.error(result.error?.message || "Erro ao alterar status")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar status")
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nome: product.nome,
      codigo: product.codigo,
      preco: product.preco.toString(),
      descricao: product.descricao || "",
    })
    setIsEditDialogOpen(true)
  }

  const runHomologationTests = async () => {
    setIsRunningTests(true)
    setTestProgress(0)

    const tests = [
      {
        name: "GET - Listar produtos",
        test: async () => {
          const response = await fetch("/api/bling/homologacao/produtos")
          return response.ok
        },
      },
      {
        name: "POST - Criar produto",
        test: async () => {
          const response = await fetch("/api/bling/homologacao/produtos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: "Produto Teste Homologação",
              codigo: `TEST-${Date.now()}`,
              preco: 99.99,
              descricao: "Produto criado durante teste de homologação",
            }),
          })
          return response.ok
        },
      },
      {
        name: "PUT - Atualizar produto",
        test: async () => {
          if (data?.local_products.items.length === 0) return false
          const product = data!.local_products.items[0]
          const response = await fetch(`/api/bling/homologacao/produtos/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: product.nome + " (Atualizado)",
              codigo: product.codigo,
              preco: product.preco,
              descricao: product.descricao,
            }),
          })
          return response.ok
        },
      },
      {
        name: "DELETE - Remover produto",
        test: async () => {
          if (data?.local_products.items.length === 0) return false
          const product = data!.local_products.items[data!.local_products.items.length - 1]
          const response = await fetch(`/api/bling/homologacao/produtos/${product.id}`, {
            method: "DELETE",
          })
          return response.ok
        },
      },
      {
        name: "PATCH - Alterar situação",
        test: async () => {
          if (data?.local_products.items.length === 0) return false
          const product = data!.local_products.items[0]
          const response = await fetch(`/api/bling/homologacao/produtos/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ situacao: "I" }),
          })
          return response.ok
        },
      },
      {
        name: "Webhooks - Receber eventos",
        test: async () => {
          const response = await fetch("/api/bling/webhooks")
          return response.ok
        },
      },
    ]

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]

      // Atualizar status para "running"
      setTestResults((prev) => prev.map((result, index) => (index === i ? { ...result, status: "running" } : result)))

      try {
        const startTime = Date.now()
        const success = await test.test()
        const duration = Date.now() - startTime

        setTestResults((prev) =>
          prev.map((result, index) =>
            index === i
              ? {
                  ...result,
                  status: success ? "success" : "error",
                  message: success ? `Concluído em ${duration}ms` : "Falha no teste",
                  duration,
                }
              : result,
          ),
        )
      } catch (error) {
        setTestResults((prev) =>
          prev.map((result, index) =>
            index === i
              ? {
                  ...result,
                  status: "error",
                  message: error instanceof Error ? error.message : "Erro desconhecido",
                }
              : result,
          ),
        )
      }

      setTestProgress(((i + 1) / tests.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Pausa entre testes
    }

    setIsRunningTests(false)
    await loadData() // Recarregar dados após os testes
  }

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const TestStatusIcon = ({ status }: { status: TestResult["status"] }) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando dados de homologação...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧪 Homologação Bling</h1>
          <p className="text-muted-foreground">
            Interface completa para teste e validação da integração com a API do Bling v3
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusIcon status={data?.database.connection_ok || false} />
              <span className="text-sm">{data?.database.connection_ok ? "Conectado" : "Desconectado"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tabelas: {data?.database.tables_exist ? "OK" : "Erro"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Bling</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusIcon status={data?.api.bling_connected || false} />
              <span className="text-sm">{data?.api.bling_connected ? "Conectado" : "Desconectado"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Token: {data?.api.token_valid ? "Válido" : "Inválido"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Locais</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.local_products.count || 0}</div>
            <p className="text-xs text-muted-foreground">Total: {data?.local_products.total || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Bling</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.bling_products.count || 0}</div>
            {data?.bling_products.error && <p className="text-xs text-red-500 mt-1">{data.bling_products.error}</p>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="tests">Testes de Homologação</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produtos para Homologação</CardTitle>
                  <CardDescription>
                    Gerencie produtos para teste da integração Bling - Total: {data?.local_products.total || 0}
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Produto</DialogTitle>
                      <DialogDescription>Adicione um novo produto para homologação</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Nome do produto"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="codigo">Código *</Label>
                        <Input
                          id="codigo"
                          value={formData.codigo}
                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          placeholder="Código único"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="preco">Preço</Label>
                        <Input
                          id="preco"
                          type="number"
                          step="0.01"
                          value={formData.preco}
                          onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          placeholder="Descrição do produto"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={createProduct} disabled={!formData.nome || !formData.codigo}>
                          Criar Produto
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {data?.local_products.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto encontrado</p>
                  <p className="text-sm">Crie o primeiro produto para iniciar a homologação</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bling ID</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.local_products.items.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.nome}</TableCell>
                        <TableCell>{product.codigo}</TableCell>
                        <TableCell>R$ {product.preco.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={product.situacao === "Ativo" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleProductStatus(product)}
                          >
                            {product.situacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.bling_id ? (
                            <Badge variant="outline">{product.bling_id}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Local</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
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

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testes de Homologação</CardTitle>
                  <CardDescription>Execute todos os testes necessários para validação da integração</CardDescription>
                </div>
                <Button onClick={runHomologationTests} disabled={isRunningTests}>
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Executar Testes
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRunningTests && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso dos Testes</span>
                    <span>{Math.round(testProgress)}%</span>
                  </div>
                  <Progress value={testProgress} />
                </div>
              )}

              <div className="space-y-3">
                {testResults.map((test, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      test.status === "success"
                        ? "bg-green-50 border-green-200"
                        : test.status === "error"
                          ? "bg-red-50 border-red-200"
                          : test.status === "running"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TestStatusIcon status={test.status} />
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.message && <div className="text-sm text-muted-foreground">{test.message}</div>}
                      </div>
                    </div>
                    {test.duration && (
                      <Badge variant="outline" className="text-xs">
                        {test.duration}ms
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Requisitos de Homologação Bling</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Implementar operações CRUD completas (GET, POST, PUT, DELETE, PATCH)</li>
                  <li>✅ Validar campos obrigatórios e formatos de dados</li>
                  <li>✅ Tratar erros conforme documentação da API</li>
                  <li>✅ Implementar paginação e filtros</li>
                  <li>✅ Configurar webhooks para eventos em tempo real</li>
                  <li>✅ Implementar autenticação OAuth 2.0</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentação da Integração
              </CardTitle>
              <CardDescription>Guia completo da implementação conforme documentação Bling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Endpoints Implementados</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        GET
                      </Badge>
                      <code>/api/bling/homologacao/produtos</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600">
                        POST
                      </Badge>
                      <code>/api/bling/homologacao/produtos</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-yellow-600">
                        PUT
                      </Badge>
                      <code>/api/bling/homologacao/produtos/{`{id}`}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-red-600">
                        DELETE
                      </Badge>
                      <code>/api/bling/homologacao/produtos/{`{id}`}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-600">
                        PATCH
                      </Badge>
                      <code>/api/bling/homologacao/produtos/{`{id}`}</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Recursos Implementados</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>OAuth 2.0 com refresh token</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Webhooks com validação de assinatura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Tratamento de erros padronizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Paginação e filtros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Logs de auditoria</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Headers de homologação</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Configuração de Ambiente</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm">
                    {`# Variáveis de ambiente necessárias
BLING_CLIENT_ID=44866dbd8fe131077d73dbe3d60531016512c855
BLING_CLIENT_SECRET=18176f2b734f4abced1893fe39a852b6f28ff53c2a564348ebfe960367d1
BLING_API_URL=https://www.bling.com.br/Api/v3
BLING_WEBHOOK_SECRET=sua_chave_secreta_aqui
NEXT_PUBLIC_BASE_URL=https://seu-dominio.vercel.app`}
                  </pre>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Links Úteis</h4>
                <div className="space-y-2">
                  <a
                    href="https://developer.bling.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Settings className="h-4 w-4" />
                    Documentação Oficial Bling
                  </a>
                  <a href="/configuracao-bling" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Settings className="h-4 w-4" />
                    Configuração da Integração
                  </a>
                  <a href="/webhooks" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Webhook className="h-4 w-4" />
                    Configuração de Webhooks
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Atualize as informações do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-codigo">Código *</Label>
              <Input
                id="edit-codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-preco">Preço</Label>
              <Input
                id="edit-preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={updateProduct} disabled={!formData.nome || !formData.codigo}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
