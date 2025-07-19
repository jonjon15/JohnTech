"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Package, Plus, Trash2, RefreshCw, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  nome: string
  codigo?: string
  preco?: number
  situacao?: string
}

export default function HomologacaoPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    descricao: "",
  })
  const [activeTab, setActiveTab] = useState("list")
  const [stats, setStats] = useState({
    total: 0,
    elapsed_time: 0,
    last_update: "",
  })
  const { toast } = useToast()

  const loadProducts = async () => {
    setLoading(true)
    try {
      console.log("🔄 Carregando produtos...")
      const startTime = Date.now()

      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      const elapsed = Date.now() - startTime

      console.log("📊 Resposta:", { status: response.status, elapsed, data })

      if (response.ok) {
        const productList = data.data || []
        setProducts(productList)
        setStats({
          total: productList.length,
          elapsed_time: elapsed,
          last_update: new Date().toLocaleTimeString(),
        })

        toast({
          title: "✅ Produtos carregados",
          description: `${productList.length} produtos em ${elapsed}ms`,
        })
      } else {
        throw new Error(data.error || `Erro ${response.status}`)
      }
    } catch (error: any) {
      console.error("❌ Erro ao carregar produtos:", error)
      toast({
        title: "❌ Erro ao carregar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async () => {
    if (!formData.nome || !formData.codigo) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Nome e código são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      console.log("➕ Criando produto:", formData)

      const productData = {
        nome: formData.nome,
        codigo: formData.codigo,
        preco: formData.preco ? Number.parseFloat(formData.preco) : 0,
        descricao: formData.descricao || "",
        situacao: "Ativo",
        formato: "S", // Simples
        tipo: "P", // Produto
      }

      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Produto criado",
          description: `${formData.nome} criado com sucesso`,
        })

        // Limpar formulário
        setFormData({ nome: "", codigo: "", preco: "", descricao: "" })

        // Recarregar lista
        await loadProducts()
        setActiveTab("list")
      } else {
        throw new Error(data.error || `Erro ${response.status}`)
      }
    } catch (error: any) {
      console.error("❌ Erro ao criar produto:", error)
      toast({
        title: "❌ Erro ao criar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${productId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Produto excluído",
          description: "Produto removido com sucesso",
        })

        await loadProducts()
      } else {
        throw new Error(data.error || `Erro ${response.status}`)
      }
    } catch (error: any) {
      console.error("❌ Erro ao excluir:", error)
      toast({
        title: "❌ Erro ao excluir",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-6 w-6" />
              Homologação Bling - CRUD Produtos
            </CardTitle>
            <CardDescription className="text-white/70">
              Teste completo das operações Create, Read, Update, Delete
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        {stats.last_update && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-white/70 text-sm">Produtos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.elapsed_time}ms</div>
                  <div className="text-white/70 text-sm">Tempo de resposta</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.last_update}</div>
                  <div className="text-white/70 text-sm">Última atualização</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="list" className="text-white">
              📋 Listar Produtos
            </TabsTrigger>
            <TabsTrigger value="create" className="text-white">
              ➕ Criar Produto
            </TabsTrigger>
          </TabsList>

          {/* Lista de Produtos */}
          <TabsContent value="list" className="space-y-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Produtos Cadastrados</CardTitle>
                  <Button onClick={loadProducts} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {loading ? "Carregando..." : "Atualizar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum produto encontrado. Clique em "Atualizar" para carregar ou crie um novo produto.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{product.nome}</h3>
                          <div className="flex gap-4 text-sm text-white/70">
                            <span>ID: {product.id}</span>
                            {product.codigo && <span>Código: {product.codigo}</span>}
                            {product.preco && <span>Preço: R$ {product.preco}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-white border-white/20">
                            {product.situacao || "Ativo"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Criar Produto */}
          <TabsContent value="create" className="space-y-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Criar Novo Produto</CardTitle>
                <CardDescription className="text-white/70">
                  Preencha os dados para criar um produto de teste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-white">
                      Nome do Produto *
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Produto Teste Homologação"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo" className="text-white">
                      Código do Produto *
                    </Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="Ex: TESTE001"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="preco" className="text-white">
                    Preço
                  </Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    placeholder="Ex: 99.90"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-white">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do produto para homologação..."
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Button onClick={createProduct} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Produto
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instruções */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processo de Homologação
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/70 space-y-2">
            <p>✅ 1. Listar produtos existentes (READ)</p>
            <p>✅ 2. Criar novo produto (CREATE)</p>
            <p>✅ 3. Editar produto existente (UPDATE)</p>
            <p>✅ 4. Excluir produto (DELETE)</p>
            <p className="text-green-400 font-medium">🎯 Execute todas as operações para completar a homologação!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
