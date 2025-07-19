"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Settings,
} from "lucide-react"

interface Produto {
  id: number
  nome: string
  codigo?: string
  preco?: number
  situacao?: string
  tipo?: string
  formato?: string
  descricaoCurta?: string
  dataInclusao?: string
  dataAlteracao?: string
}

interface TestResult {
  operation: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
  elapsedTime?: number
}

export default function HomologacaoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    descricaoCurta: "",
    tipo: "P",
    formato: "S",
    situacao: "A",
  })

  // Carregar produtos
  const loadProdutos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bling/homologacao/produtos?limite=20")
      const result = await response.json()

      if (result.success && result.data?.data) {
        setProdutos(result.data.data)
      } else {
        console.error("Erro ao carregar produtos:", result)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Executar testes de homologação
  const runHomologationTests = async () => {
    setTestResults([])
    const tests: TestResult[] = []

    // Teste 1: Listar produtos
    tests.push({ operation: "GET /produtos", status: "pending", message: "Testando listagem..." })
    setTestResults([...tests])

    try {
      const startTime = Date.now()
      const response = await fetch("/api/bling/homologacao/produtos?limite=5")
      const result = await response.json()
      const elapsedTime = Date.now() - startTime

      if (result.success) {
        tests[0] = {
          operation: "GET /produtos",
          status: "success",
          message: `✅ ${result.data?.data?.length || 0} produtos listados`,
          data: result.data,
          elapsedTime,
        }
      } else {
        tests[0] = {
          operation: "GET /produtos",
          status: "error",
          message: `❌ ${result.error?.message || "Erro desconhecido"}`,
          elapsedTime,
        }
      }
    } catch (error) {
      tests[0] = {
        operation: "GET /produtos",
        status: "error",
        message: `❌ Erro de conexão: ${error}`,
      }
    }

    setTestResults([...tests])

    // Teste 2: Criar produto
    tests.push({ operation: "POST /produtos", status: "pending", message: "Testando criação..." })
    setTestResults([...tests])

    try {
      const startTime = Date.now()
      const produtoTeste = {
        nome: `Produto Teste ${Date.now()}`,
        codigo: `TEST${Date.now()}`,
        preco: 99.99,
        tipo: "P",
        formato: "S",
        situacao: "A",
        descricaoCurta: "Produto criado para teste de homologação",
      }

      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produtoTeste),
      })
      const result = await response.json()
      const elapsedTime = Date.now() - startTime

      if (result.success) {
        tests[1] = {
          operation: "POST /produtos",
          status: "success",
          message: `✅ Produto criado: ID ${result.data?.data?.id}`,
          data: result.data,
          elapsedTime,
        }

        // Teste 3: Atualizar produto criado
        if (result.data?.data?.id) {
          tests.push({ operation: "PUT /produtos/{id}", status: "pending", message: "Testando atualização..." })
          setTestResults([...tests])

          try {
            const updateStartTime = Date.now()
            const produtoAtualizado = {
              ...produtoTeste,
              nome: `${produtoTeste.nome} - ATUALIZADO`,
              preco: 149.99,
            }

            const updateResponse = await fetch(`/api/bling/homologacao/produtos/${result.data.data.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(produtoAtualizado),
            })
            const updateResult = await updateResponse.json()
            const updateElapsedTime = Date.now() - updateStartTime

            if (updateResult.success) {
              tests[2] = {
                operation: "PUT /produtos/{id}",
                status: "success",
                message: `✅ Produto atualizado: ID ${result.data.data.id}`,
                data: updateResult.data,
                elapsedTime: updateElapsedTime,
              }
            } else {
              tests[2] = {
                operation: "PUT /produtos/{id}",
                status: "error",
                message: `❌ ${updateResult.error?.message || "Erro na atualização"}`,
                elapsedTime: updateElapsedTime,
              }
            }
          } catch (error) {
            tests[2] = {
              operation: "PUT /produtos/{id}",
              status: "error",
              message: `❌ Erro na atualização: ${error}`,
            }
          }

          setTestResults([...tests])

          // Teste 4: Excluir produto
          tests.push({ operation: "DELETE /produtos/{id}", status: "pending", message: "Testando exclusão..." })
          setTestResults([...tests])

          try {
            const deleteStartTime = Date.now()
            const deleteResponse = await fetch(`/api/bling/homologacao/produtos/${result.data.data.id}`, {
              method: "DELETE",
            })
            const deleteResult = await deleteResponse.json()
            const deleteElapsedTime = Date.now() - deleteStartTime

            if (deleteResult.success) {
              tests[3] = {
                operation: "DELETE /produtos/{id}",
                status: "success",
                message: `✅ Produto excluído: ID ${result.data.data.id}`,
                data: deleteResult.data,
                elapsedTime: deleteElapsedTime,
              }
            } else {
              tests[3] = {
                operation: "DELETE /produtos/{id}",
                status: "error",
                message: `❌ ${deleteResult.error?.message || "Erro na exclusão"}`,
                elapsedTime: deleteElapsedTime,
              }
            }
          } catch (error) {
            tests[3] = {
              operation: "DELETE /produtos/{id}",
              status: "error",
              message: `❌ Erro na exclusão: ${error}`,
            }
          }
        }
      } else {
        tests[1] = {
          operation: "POST /produtos",
          status: "error",
          message: `❌ ${result.error?.message || "Erro na criação"}`,
          elapsedTime,
        }
      }
    } catch (error) {
      tests[1] = {
        operation: "POST /produtos",
        status: "error",
        message: `❌ Erro de conexão: ${error}`,
      }
    }

    setTestResults([...tests])
  }

  // Criar produto
  const createProduto = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          codigo: formData.codigo,
          preco: Number.parseFloat(formData.preco) || 0,
          descricaoCurta: formData.descricaoCurta,
          tipo: formData.tipo,
          formato: formData.formato,
          situacao: formData.situacao,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Produto criado com sucesso!")
        setFormData({
          nome: "",
          codigo: "",
          preco: "",
          descricaoCurta: "",
          tipo: "P",
          formato: "S",
          situacao: "A",
        })
        loadProdutos()
      } else {
        alert(`Erro: ${result.error?.message}`)
      }
    } catch (error) {
      alert(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Excluir produto
  const deleteProduto = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        alert("Produto excluído com sucesso!")
        loadProdutos()
      } else {
        alert(`Erro: ${result.error?.message}`)
      }
    } catch (error) {
      alert(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProdutos()
  }, [])

  const getStatusBadge = (status: "success" | "error" | "pending") => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sucesso
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Executando
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homologação Bling API</h1>
          <p className="text-muted-foreground">Testes e validação da integração com a API do Bling</p>
        </div>
        <Button onClick={loadProdutos} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Esta página executa testes de homologação conforme a documentação oficial do Bling. Todos os testes incluem os
          headers necessários como <code>x-bling-homologacao: true</code>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Testes Automatizados</TabsTrigger>
          <TabsTrigger value="products">Gerenciar Produtos</TabsTrigger>
          <TabsTrigger value="create">Criar Produto</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Testes de Homologação
              </CardTitle>
              <CardDescription>Executa todos os testes necessários para validação da API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runHomologationTests} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Executar Testes
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Resultados dos Testes:</h3>
                  {testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(test.status)}
                        <span className="font-mono text-sm">{test.operation}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{test.message}</div>
                        {test.elapsedTime && <div className="text-xs text-muted-foreground">{test.elapsedTime}ms</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Produtos ({produtos.length})
              </CardTitle>
              <CardDescription>Lista de produtos obtidos da API do Bling</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Carregando produtos...</p>
                </div>
              ) : produtos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {produtos.map((produto) => (
                    <div key={produto.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{produto.nome}</h3>
                        <div className="text-sm text-muted-foreground space-x-4">
                          <span>ID: {produto.id}</span>
                          {produto.codigo && <span>Código: {produto.codigo}</span>}
                          {produto.preco && <span>Preço: R$ {produto.preco}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {produto.situacao && (
                          <Badge variant={produto.situacao === "A" ? "default" : "secondary"}>
                            {produto.situacao === "A" ? "Ativo" : "Inativo"}
                          </Badge>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedProduto(produto)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteProduto(produto.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Criar Novo Produto
              </CardTitle>
              <CardDescription>Formulário para criar produtos via API do Bling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do produto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Código do produto"
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
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    className="w-full p-2 border rounded-md"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="P">Produto</option>
                    <option value="S">Serviço</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Curta</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricaoCurta}
                  onChange={(e) => setFormData({ ...formData, descricaoCurta: e.target.value })}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>
              <Button onClick={createProduto} disabled={loading || !formData.nome}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Criando..." : "Criar Produto"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
