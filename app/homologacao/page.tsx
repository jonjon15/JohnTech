"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from "lucide-react"

interface Product {
  id: number
  nome: string
  descricao: string
  preco: string
  estoque: number
  bling_id?: string
  created_at: string
  updated_at: string
}

interface ApiResponse {
  success: boolean
  data?: {
    produtos?: Product[]
    produto?: Product
    total?: number
  }
  error?: {
    code: string
    message: string
  }
}

export default function HomologacaoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
  })

  // Carregar produtos
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/bling/homologacao/produtos")
      const data: ApiResponse = await response.json()

      if (data.success && data.data?.produtos) {
        setProducts(data.data.produtos)
      } else {
        setError(data.error?.message || "Erro ao carregar produtos")
      }
    } catch (err) {
      setError("Erro de conexão ao carregar produtos")
      console.error("Erro ao carregar produtos:", err)
    } finally {
      setLoading(false)
    }
  }

  // Criar produto
  const createProduct = async () => {
    try {
      setError(null)
      setSuccess(null)

      const payload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: Number.parseFloat(formData.preco) || 0,
        estoque: Number.parseInt(formData.estoque) || 0,
      }

      const response = await fetch("/api/bling/homologacao/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data: ApiResponse = await response.json()

      if (data.success && data.data?.produto) {
        setProducts((prev) => [data.data!.produto!, ...prev])
        setFormData({ nome: "", descricao: "", preco: "", estoque: "" })
        setShowForm(false)
        setSuccess("Produto criado com sucesso!")
      } else {
        setError(data.error?.message || "Erro ao criar produto")
      }
    } catch (err) {
      setError("Erro de conexão ao criar produto")
      console.error("Erro ao criar produto:", err)
    }
  }

  // Atualizar produto
  const updateProduct = async (id: number, updatedData: Partial<Product>) => {
    try {
      setError(null)
      setSuccess(null)

      const payload = {
        nome: updatedData.nome?.trim(),
        descricao: updatedData.descricao?.trim(),
        preco: updatedData.preco ? Number.parseFloat(updatedData.preco) : undefined,
        estoque: updatedData.estoque,
      }

      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data: ApiResponse = await response.json()

      if (data.success && data.data?.produto) {
        setProducts((prev) => prev.map((p) => (p.id === id ? data.data!.produto! : p)))
        setEditingId(null)
        setSuccess("Produto atualizado com sucesso!")
      } else {
        setError(data.error?.message || "Erro ao atualizar produto")
      }
    } catch (err) {
      setError("Erro de conexão ao atualizar produto")
      console.error("Erro ao atualizar produto:", err)
    }
  }

  // Deletar produto
  const deleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "DELETE",
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setSuccess("Produto deletado com sucesso!")
      } else {
        setError(data.error?.message || "Erro ao deletar produto")
      }
    } catch (err) {
      setError("Erro de conexão ao deletar produto")
      console.error("Erro ao deletar produto:", err)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Auto-hide messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Homologação - Produtos</h1>
        <p className="text-muted-foreground">
          Ambiente de testes para gerenciar produtos localmente antes da integração com o Bling.
        </p>
      </div>

      {/* Mensagens de Status */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Botão Adicionar Produto */}
      <div className="mb-6">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Adicionar Produto"}
        </Button>
      </div>

      {/* Formulário de Criação */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
            <CardDescription>Preencha os dados do produto para criar um novo item.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <Label htmlFor="preco">Preço</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={(e) => setFormData((prev) => ({ ...prev, preco: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do produto"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="estoque">Estoque</Label>
              <Input
                id="estoque"
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => setFormData((prev) => ({ ...prev, estoque: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createProduct} disabled={!formData.nome.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Criar Produto
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
          <CardDescription>{loading ? "Carregando..." : `${products.length} produto(s) encontrado(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum produto cadastrado ainda.</p>
              <p className="text-sm mt-2">Clique em "Adicionar Produto" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  {editingId === product.id ? (
                    <EditProductForm product={product} onSave={updateProduct} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{product.nome}</h3>
                          {product.bling_id && <Badge variant="secondary">Bling: {product.bling_id}</Badge>}
                        </div>
                        {product.descricao && <p className="text-sm text-muted-foreground mb-2">{product.descricao}</p>}
                        <div className="flex items-center gap-4 text-sm">
                          <span>Preço: R$ {product.preco}</span>
                          <span>Estoque: {product.estoque}</span>
                          <span className="text-muted-foreground">ID: {product.id}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Criado: {new Date(product.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(product.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para edição inline
function EditProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product
  onSave: (id: number, data: Partial<Product>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    nome: product.nome,
    descricao: product.descricao,
    preco: product.preco,
    estoque: product.estoque.toString(),
  })

  const handleSave = () => {
    onSave(product.id, {
      nome: editData.nome.trim(),
      descricao: editData.descricao.trim(),
      preco: editData.preco,
      estoque: Number.parseInt(editData.estoque) || 0,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`edit-nome-${product.id}`}>Nome</Label>
          <Input
            id={`edit-nome-${product.id}`}
            value={editData.nome}
            onChange={(e) => setEditData((prev) => ({ ...prev, nome: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor={`edit-preco-${product.id}`}>Preço</Label>
          <Input
            id={`edit-preco-${product.id}`}
            value={editData.preco}
            onChange={(e) => setEditData((prev) => ({ ...prev, preco: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`edit-descricao-${product.id}`}>Descrição</Label>
        <Textarea
          id={`edit-descricao-${product.id}`}
          value={editData.descricao}
          onChange={(e) => setEditData((prev) => ({ ...prev, descricao: e.target.value }))}
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor={`edit-estoque-${product.id}`}>Estoque</Label>
        <Input
          id={`edit-estoque-${product.id}`}
          type="number"
          min="0"
          value={editData.estoque}
          onChange={(e) => setEditData((prev) => ({ ...prev, estoque: e.target.value }))}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
