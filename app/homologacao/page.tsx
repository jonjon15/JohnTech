"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertTriangle, Trash2, Edit, TestTube, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/contexts/theme-context" // Corrigido

interface HomologationProduct {
  id: string
  nome: string
  codigo: string
  preco: number
  tipo: string
  situacao: string
  status: "pending" | "approved" | "rejected" // Status interno para UI
  createdAt: string
}

export default function HomologacaoPage() {
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"
  const [products, setProducts] = useState<HomologationProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    tipo: "P",
    situacao: "Ativo",
    descricaoCurta: "",
    unidade: "UN",
    pesoLiquido: "",
    pesoBruto: "",
    gtin: "",
    marca: "",
    observacoes: "",
  })
  const [testResults, setTestResults] = useState({
    auth: { status: "pending", message: "Aguardando execução" },
    createProduct: { status: "pending", message: "Aguardando execução" },
    updateProduct: { status: "pending", message: "Aguardando execução" },
    deleteProduct: { status: "pending", message: "Aguardando execução" },
    webhooks: { status: "pending", message: "Aguardando execução" },
  })
  const { toast } = useToast()

  useEffect(() => {
    loadHomologationProducts()
  }, [])

  const loadHomologationProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bling/homologacao/produtos")
      if (response.ok) {
        const data = await response.json()
        // Adiciona um status mock para a UI, em um cenário real viria da API
        const productsWithStatus = (data.data || []).map((p: any) => ({
          ...p,
          status: "pending", // Mock status for UI
          createdAt: new Date().toISOString(),
        }))
        setProducts(productsWithStatus)
      } else {
        toast({
          title: "Erro",
          description: "Falha ao carregar produtos de homologação",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          preco: Number.parseFloat(formData.preco),
          pesoLiquido: Number.parseFloat(formData.pesoLiquido) || 0,
          pesoBruto: Number.parseFloat(formData.pesoBruto) || 0,
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Produto de homologação criado com sucesso",
        })
        setFormData({
          nome: "",
          codigo: "",
          preco: "",
          tipo: "P",
          situacao: "Ativo",
          descricaoCurta: "",
          unidade: "UN",
          pesoLiquido: "",
          pesoBruto: "",
          gtin: "",
          marca: "",
          observacoes: "",
        })
        loadHomologationProducts()
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro",
          description: errorData.error || "Falha ao criar produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão ao criar produto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto de homologação?")) return

    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Produto excluído com sucesso",
        })
        loadHomologationProducts()
      } else {
        toast({
          title: "Erro",
          description: "Falha ao excluir produto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão ao excluir produto",
        variant: "destructive",
      })
    }
  }

  const runHomologationTests = async () => {
    setLoading(true)
    setTestResults({
      auth: { status: "pending", message: "Aguardando execução" },
      createProduct: { status: "pending", message: "Aguardando execução" },
      updateProduct: { status: "pending", message: "Aguardando execução" },
      deleteProduct: { status: "pending", message: "Aguardando execução" },
      webhooks: { status: "pending", message: "Aguardando execução" },
    })

    let testProductId: string | null = null

    try {
      // Teste 1: Autenticação (já testada no fluxo OAuth, aqui é uma verificação)
      setTestResults((prev) => ({ ...prev, auth: { status: "loading", message: "Verificando autenticação..." } }))
      const authCheckResponse = await fetch("/api/bling/products") // Usa um endpoint que requer auth
      if (authCheckResponse.ok) {
        setTestResults((prev) => ({ ...prev, auth: { status: "success", message: "Autenticação OK" } }))
      } else {
        const errorData = await authCheckResponse.json()
        setTestResults((prev) => ({
          ...prev,
          auth: { status: "failed", message: `Autenticação Falhou: ${errorData.error || "Erro desconhecido"}` },
        }))
        throw new Error("Auth failed") // Interrompe se a autenticação falhar
      }
      await new Promise((resolve) => setTimeout(500))

      // Teste 2: Criar Produto de Homologação
      setTestResults((prev) => ({
        ...prev,
        createProduct: { status: "loading", message: "Criando produto de homologação..." },
      }))
      const newProductCode = `TESTE-${Date.now()}`
      const createResponse = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: `Produto Teste Homologação ${newProductCode}`,
          codigo: newProductCode,
          preco: 10.0,
          tipo: "P",
          situacao: "Ativo",
          unidade: "UN",
        }),
      })
      const createData = await createResponse.json()
      if (createResponse.ok && createData.data?.id) {
        testProductId = createData.data.id
        setTestResults((prev) => ({
          ...prev,
          createProduct: { status: "success", message: `Produto criado: ${newProductCode}` },
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          createProduct: {
            status: "failed",
            message: `Falha ao criar produto: ${createData.details?.error || createData.error || "Erro desconhecido"}`,
          },
        }))
        throw new Error("Create product failed")
      }
      await new Promise((resolve) => setTimeout(500))

      // Teste 3: Atualizar Produto de Homologação
      setTestResults((prev) => ({
        ...prev,
        updateProduct: { status: "loading", message: "Atualizando produto de homologação..." },
      }))
      if (!testProductId) throw new Error("No product ID to update")
      const updateResponse = await fetch(`/api/bling/homologacao/produtos/${testProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: `Produto Teste Homologação ${newProductCode} (Atualizado)` }),
      })
      const updateData = await updateResponse.json()
      if (updateResponse.ok) {
        setTestResults((prev) => ({
          ...prev,
          updateProduct: { status: "success", message: "Produto atualizado com sucesso" },
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          updateProduct: {
            status: "failed",
            message: `Falha ao atualizar produto: ${updateData.details?.error || updateData.error || "Erro desconhecido"}`,
          },
        }))
        throw new Error("Update product failed")
      }
      await new Promise((resolve) => setTimeout(500))

      // Teste 4: Excluir Produto de Homologação
      setTestResults((prev) => ({
        ...prev,
        deleteProduct: { status: "loading", message: "Excluindo produto de homologação..." },
      }))
      if (!testProductId) throw new Error("No product ID to delete")
      const deleteResponse = await fetch(`/api/bling/homologacao/produtos/${testProductId}`, {
        method: "DELETE",
      })
      if (deleteResponse.ok) {
        setTestResults((prev) => ({
          ...prev,
          deleteProduct: { status: "success", message: "Produto excluído com sucesso" },
        }))
      } else {
        const errorData = await deleteResponse.json()
        setTestResults((prev) => ({
          ...prev,
          deleteProduct: {
            status: "failed",
            message: `Falha ao excluir produto: ${errorData.error || "Erro desconhecido"}`,
          },
        }))
        throw new Error("Delete product failed")
      }
      await new Promise((resolve) => setTimeout(500))

      // Teste 5: Webhooks (Este teste é mais complexo e requer configuração externa)
      setTestResults((prev) => ({
        ...prev,
        webhooks: {
          status: "info",
          message:
            "Teste de Webhooks: Verifique manualmente no Bling se os webhooks foram disparados e recebidos. (Este teste não é automatizado aqui)",
        },
      }))
      await new Promise((resolve) => setTimeout(500))

      toast({
        title: "Testes de Homologação Concluídos",
        description: "Verifique os resultados abaixo e os logs do Vercel para detalhes.",
      })
    } catch (error: any) {
      toast({
        title: "Testes Interrompidos",
        description: `Um teste falhou: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      loadHomologationProducts() // Recarrega a lista de produtos
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case "failed":
        return <XCircle className="h-6 w-6 text-red-400" />
      case "loading":
        return <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
      case "info":
        return <AlertTriangle className="h-6 w-6 text-blue-400" />
      default:
        return <TestTube className="h-6 w-6 text-white/50" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-600/20 text-green-300 border-green-500/30"
      case "failed":
        return "bg-red-600/20 text-red-300 border-red-500/30"
      case "loading":
        return "bg-purple-600/20 text-purple-300 border-purple-500/30 animate-pulse"
      case "info":
        return "bg-blue-600/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div
      className={`min-h-screen pt-20 ${
        isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className={`bg-white/5 border-white/10 ${isWakanda ? "bg-green-950/20 border-green-500/20" : ""}`}>
            <TabsTrigger
              value="products"
              className={`data-[state=active]:${isWakanda ? "bg-green-600" : "bg-purple-600"}`}
            >
              Produtos de Homologação
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className={`data-[state=active]:${isWakanda ? "bg-green-600" : "bg-purple-600"}`}
            >
              Criar Produto
            </TabsTrigger>
            <TabsTrigger
              value="tests"
              className={`data-[state=active]:${isWakanda ? "bg-green-600" : "bg-purple-600"}`}
            >
              Testes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card
              className={`backdrop-blur-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                    Produtos de Homologação
                  </CardTitle>
                  <Button
                    onClick={loadHomologationProducts}
                    disabled={loading}
                    variant="outline"
                    className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""}`}
                  >
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${isWakanda ? "bg-green-950/20 border-green-500/20" : "bg-white/5 border-white/10"}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className={`font-medium ${isWakanda ? "text-green-100" : "text-white"}`}>
                            {product.nome}
                          </h3>
                          <Badge
                            variant={
                              product.status === "approved"
                                ? "default"
                                : product.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              product.status === "approved"
                                ? isWakanda
                                  ? "bg-green-600/20 text-green-300 border-green-500/30"
                                  : "bg-green-600/20 text-green-300 border-green-500/30"
                                : product.status === "rejected"
                                  ? isWakanda
                                    ? "bg-red-600/20 text-red-300 border-red-500/30"
                                    : "bg-red-600/20 text-red-300 border-red-500/30"
                                  : isWakanda
                                    ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
                                    : "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
                            }
                          >
                            {product.status === "approved"
                              ? "Aprovado"
                              : product.status === "rejected"
                                ? "Rejeitado"
                                : "Pendente"}
                          </Badge>
                        </div>
                        <p className={`text-sm ${isWakanda ? "text-green-100/60" : "text-white/60"}`}>
                          Código: {product.codigo}
                        </p>
                        <div
                          className={`flex items-center space-x-4 mt-2 text-sm ${isWakanda ? "text-green-100/70" : "text-white/70"}`}
                        >
                          <span>Preço: R$ {product.preco.toFixed(2)}</span>
                          <span>Tipo: {product.tipo === "P" ? "Produto" : "Serviço"}</span>
                          <span>Status: {product.situacao}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(product.id)}
                          variant="outline"
                          size="sm"
                          className={`border-red-500/30 text-red-300 hover:bg-red-500/10 bg-transparent ${isWakanda ? "border-red-500/30 text-red-300 hover:bg-red-500/10" : ""}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && !loading && (
                    <div className="text-center py-8 text-white/60">Nenhum produto de homologação encontrado</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card
              className={`backdrop-blur-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
            >
              <CardHeader>
                <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                  Criar Produto de Homologação
                </CardTitle>
                <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                  Preencha os dados do produto conforme especificação Bling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Nome do Produto *
                      </Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                        placeholder="Nome do produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codigo" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Código *
                      </Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        required
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                        placeholder="Código único do produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preco" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Preço *
                      </Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                        required
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Tipo *
                      </Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger
                          className={`bg-white/10 border-white/20 text-white ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="P">Produto</SelectItem>
                          <SelectItem value="S">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="situacao" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Situação *
                      </Label>
                      <Select
                        value={formData.situacao}
                        onValueChange={(value) => setFormData({ ...formData, situacao: value })}
                      >
                        <SelectTrigger
                          className={`bg-white/10 border-white/20 text-white ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unidade" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Unidade
                      </Label>
                      <Input
                        id="unidade"
                        value={formData.unidade}
                        onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                        placeholder="UN"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gtin" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        GTIN/EAN
                      </Label>
                      <Input
                        id="gtin"
                        value={formData.gtin}
                        onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                        placeholder="Código de barras"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marca" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                        Marca
                      </Label>
                      <Input
                        id="marca"
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                        placeholder="Marca do produto"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricaoCurta" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                      Descrição Curta
                    </Label>
                    <Textarea
                      id="descricaoCurta"
                      value={formData.descricaoCurta}
                      onChange={(e) => setFormData({ ...formData, descricaoCurta: e.target.value })}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                      placeholder="Descrição breve do produto"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${isWakanda ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50" : ""}`}
                      placeholder="Observações adicionais"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full ${isWakanda ? "bg-green-600 hover:bg-green-700 text-black font-semibold wakanda-glow" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
                  >
                    {loading ? "Criando..." : "Criar Produto de Homologação"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card
              className={`backdrop-blur-sm ${isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : "bg-white/5 border-white/10"}`}
            >
              <CardHeader>
                <CardTitle className={`${isWakanda ? "text-green-100" : "text-white"}`}>
                  Execução dos Testes de Homologação
                </CardTitle>
                <CardDescription className={`${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                  Execute os testes de CRUD de produtos de homologação e verifique o status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults).map(([key, test]) => (
                    <div key={key} className={`flex items-center p-4 rounded-lg border ${getStatusBadge(test.status)}`}>
                      <div className="mr-3">{getStatusIcon(test.status)}</div>
                      <div>
                        <h3 className={`${isWakanda ? "text-green-100" : "text-white"} font-medium capitalize`}>
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <p className={`${isWakanda ? "text-green-100/70" : "text-white/70"} text-sm`}>{test.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    onClick={runHomologationTests}
                    disabled={loading}
                    className={`bg-purple-600 hover:bg-purple-700 text-white px-8 py-3`}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          className={`h-4 w-4 mr-2 animate-spin ${isWakanda ? "text-green-400" : "text-purple-400"}`}
                        />
                        Executando Testes...
                      </>
                    ) : (
                      <>
                        <TestTube className={`h-6 w-6 ${isWakanda ? "text-green-400" : "text-white/50"}`} />
                        Executar Todos os Testes
                      </>
                    )}
                  </Button>
                </div>

                <div
                  className={`${isWakanda ? "bg-green-600/10 border border-green-500/30" : "bg-blue-600/10 border border-blue-500/30"} rounded-lg p-4`}
                >
                  <h4 className={`${isWakanda ? "text-green-300" : "text-blue-300"} font-medium mb-2`}>
                    Próximos Passos para Homologação:
                  </h4>
                  <ul className={`${isWakanda ? "text-green-200" : "text-blue-200"} text-sm space-y-1 list-disc pl-5`}>
                    <li>
                      **Execute os testes acima:** Clique em "Executar Todos os Testes" e verifique se todos os testes
                      de CRUD (Criar, Atualizar, Excluir) de produtos de homologação são bem-sucedidos.
                    </li>
                    <li>
                      **Verifique os Webhooks:** Após a execução dos testes, vá no painel do Bling e verifique se os
                      webhooks de `produto.criado`, `produto.atualizado` e `produto.excluido` foram disparados e
                      recebidos corretamente pelo seu endpoint `/api/bling/webhooks`.
                    </li>
                    <li>
                      **Teste de Estoque:** Realize alterações de estoque no Bling e verifique se seu sistema recebe as
                      notificações de `estoque.alterado` via webhook.
                    </li>
                    <li>
                      **Documentação:** Certifique-se de que sua documentação (link do manual) esteja atualizada e
                      acessível.
                    </li>
                    <li>
                      **Submissão:** Após todos os testes passarem, você pode submeter sua aplicação para homologação
                      oficial no Bling.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
