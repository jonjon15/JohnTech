"use client"

import type React from "react"

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
import { Loader2, Plus, Edit, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
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

interface ConnectionStatus {
  database: boolean
  bling_auth: boolean
  bling_api: boolean
}

export default function HomologacaoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    database: false,
    bling_auth: false,
    bling_api: false,
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    preco: "",
    descricao: "",
    situacao: "Ativo" as "Ativo" | "Inativo",
  })

  useEffect(() => {
    checkConnectionStatus()
    loadProducts()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      // Verificar banco de dados
      const dbResponse = await fetch("/api/db/status")
      const dbStatus = dbResponse.ok

      // Verificar autenticação Bling
      const authResponse = await fetch("/api/auth/bling/status")
      const authStatus = authResponse.ok

      // Verificar API Bling
      const apiResponse = await fetch("/api/bling/status")
      const apiStatus = apiResponse.ok

      setConnectionStatus({
        database: dbStatus,
        bling_auth: authStatus,
        bling_api: apiStatus,
      })
    } catch (error) {
      console.error("Erro ao verificar status:", error)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bling/homologacao/produtos")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        toast.error("Erro ao carregar produtos")
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast.error("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
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
          preco: Number.parseFloat(formData.preco),
          descricao: formData.descricao,
          situacao: formData.situacao,
        }),
      })

      if (response.ok) {
        toast.success("Produto criado com sucesso!")
        setIsCreateDialogOpen(false)
        setFormData({ nome: "", codigo: "", preco: "", descricao: "", situacao: "Ativo" })
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao criar produto")
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      toast.error("Erro ao criar produto")
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
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
          preco: Number.parseFloat(formData.preco),
          descricao: formData.descricao,
          situacao: formData.situacao,
        }),
      })

      if (response.ok) {
        toast.success("Produto atualizado com sucesso!")
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        setFormData({ nome: "", codigo: "", preco: "", descricao: "", situacao: "Ativo" })
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao atualizar produto")
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      toast.error("Erro ao atualizar produto")
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${id}`, {
        method: "DELETE",
        headers: {
          "x-bling-homologacao": "true",
        },
      })

      if (response.ok) {
        toast.success("Produto excluído com sucesso!")
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao excluir produto")
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast.error("Erro ao excluir produto")
    }
  }

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.situacao === "Ativo" ? "Inativo" : "Ativo"

    try {
      const response = await fetch(`/api/bling/homologacao/produtos/${product.id}/situacoes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-bling-homologacao": "true",
        },
        body: JSON.stringify({ situacao: newStatus }),
      })

      if (response.ok) {
        toast.success(`Produto ${newStatus.toLowerCase()} com sucesso!`)
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao alterar status")
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      toast.error("Erro ao alterar status")
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      nome: product.nome,
      codigo: product.codigo,
      preco: product.preco.toString(),
      descricao: product.descricao || "",
      situacao: product.situacao,
    })
    setIsEditDialogOpen(true)
  }

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homologação Bling</h1>
          <p className="text-muted-foreground">Interface para teste e validação da integração com a API do Bling</p>
        </div>
        <Button onClick={loadProducts} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Status da Integração
          </CardTitle>
          <CardDescription>Verificação em tempo real das conexões necessárias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon status={connectionStatus.database} />
              <span>Banco de Dados</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={connectionStatus.bling_auth} />
              <span>Autenticação Bling</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={connectionStatus.bling_api} />
              <span>API Bling</span>
            </div>
          </div>

          {!connectionStatus.bling_auth && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Autenticação necessária.
                <Button variant="link" className="p-0 h-auto ml-1" asChild>
                  <a href="/api/bling/oauth/authorize">Clique aqui para autenticar</a>
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos para Homologação</CardTitle>
              <CardDescription>Gerencie produtos para teste da integração Bling</CardDescription>
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
                <form onSubmit={handleCreateProduct} className="space-y-4">
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
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar Produto</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.nome}</TableCell>
                    <TableCell>{product.codigo}</TableCell>
                    <TableCell>R$ {product.preco.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.situacao === "Ativo" ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(product)}
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
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
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

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Atualize as informações do produto</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
