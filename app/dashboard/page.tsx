"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, TrendingUp, AlertTriangle, Search, Filter, Scan, RefreshCw, BarChart3 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context" // Corrigido

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  price: number
  status: "active" | "inactive" | "low_stock"
  lastSync: string
}

export default function DashboardPage() {
  const { theme } = useTheme()
  const isWakanda = theme === "wakanda"
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [hasLoaded, setHasLoaded] = useState(false) // Adicionar esta linha

  // Busca produtos reais da API
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (hasLoaded) return;
    setLoading(true);
    setError(null);
    fetch("/api/bling/produtos")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar produtos");
        return res.json();
      })
      .then((data) => {
        // Ajuste conforme o formato retornado pela sua API
        // Exemplo: data = { produtos: [{...}] }
        setProducts(
          (data.produtos || data) // fallback para array direto
            .map((p: any) => ({
              id: p.id?.toString() || p.bling_id?.toString() || p.codigo || Math.random().toString(),
              name: p.nome || p.name || "Produto sem nome",
              sku: p.sku || p.codigo || "-",
              stock: p.estoque ?? p.stock ?? 0,
              price: p.preco ?? p.price ?? 0,
              status:
                p.status ||
                (p.estoque !== undefined && p.estoque <= 5
                  ? "low_stock"
                  : p.situacao === "I"
                  ? "inactive"
                  : "active"),
              lastSync: p.updated_at || p.lastSync || new Date().toISOString(),
            }))
        );
        setLoading(false);
        setHasLoaded(true);
      })
      .catch((err) => {
        setError(err.message || "Erro ao buscar produtos");
        setLoading(false);
      });
  }, [hasLoaded]);

  const handleSync = async () => {
    if (syncStatus === "syncing") return // Evita múltiplas chamadas simultâneas

    setSyncStatus("syncing")

    try {
      const response = await fetch("/api/bling/sync", {
        method: "POST",
      })

      if (response.ok) {
        setSyncStatus("success")
        // Refresh products
        // In a real app, this would fetch updated data
      } else {
        setSyncStatus("error")
      }
    } catch (error) {
      setSyncStatus("error")
    }

    setTimeout(() => setSyncStatus("idle"), 3000)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.status === "low_stock").length,
    totalValue: products.reduce((sum, p) => sum + p.stock * p.price, 0),
    activeProducts: products.filter((p) => p.status === "active").length,
  }

  return (
    <div
      className={`min-h-screen pt-20 ${
        isWakanda ? "wakanda-bg wakanda-pattern" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className={`bg-white/5 border-white/10 backdrop-blur-sm ${
              isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isWakanda ? "text-green-100" : "text-white"}`}>
                {stats.totalProducts}
              </div>
              <p className={`text-xs ${isWakanda ? "text-green-100/50" : "text-white/50"}`}>Active inventory items</p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white/5 border-white/10 backdrop-blur-sm ${
              isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isWakanda ? "text-green-100" : "text-white"}`}>
                {stats.lowStock}
              </div>
              <p className={`text-xs ${isWakanda ? "text-green-100/50" : "text-white/50"}`}>Items need restocking</p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white/5 border-white/10 backdrop-blur-sm ${
              isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                Total Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isWakanda ? "text-green-100" : "text-white"}`}>
                R$ {stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-xs ${isWakanda ? "text-green-100/50" : "text-white/50"}`}>Inventory value</p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white/5 border-white/10 backdrop-blur-sm ${
              isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${isWakanda ? "text-green-100/70" : "text-white/70"}`}>
                Active Items
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isWakanda ? "text-green-100" : "text-white"}`}>
                {stats.activeProducts}
              </div>
              <p className={`text-xs ${isWakanda ? "text-green-100/50" : "text-white/50"}`}>Ready for sale</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className={`bg-white/5 border-white/10 ${isWakanda ? "bg-green-950/20 border-green-500/20" : ""}`}>
            <TabsTrigger
              value="products"
              className={`data-[state=active]:${isWakanda ? "bg-green-600" : "bg-purple-600"}`}
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="barcode"
              className={`data-[state=active]:${isWakanda ? "bg-green-600" : "bg-purple-600"}`}
            >
              Barcode Scanner
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className={`data-[state=active]:${isWakanda ? "bg-green-600" : "bg-purple-600"}`}
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Search and Filters */}
            <Card
              className={`bg-white/5 border-white/10 backdrop-blur-sm ${
                isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Product Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${
                          isWakanda
                            ? "bg-green-950/20 border-green-500/20 text-green-100 placeholder:text-green-100/50"
                            : ""
                        } pl-10`}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${
                        isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="text-red-400 font-semibold">{error}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isWakanda ? "bg-green-950/20 border-green-500/20" : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className={`font-medium ${isWakanda ? "text-green-100" : "text-white"}`}>
                              {product.name}
                            </h3>
                            <Badge
                              variant={product.status === "low_stock" ? "destructive" : "secondary"}
                              className={
                                product.status === "low_stock"
                                  ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
                                  : isWakanda
                                    ? "bg-green-600/20 text-green-300 border-green-500/30"
                                    : "bg-green-600/20 text-green-300 border-green-500/30"
                              }
                            >
                              {product.status === "low_stock" ? "Low Stock" : product.status === "inactive" ? "Inactive" : "Active"}
                            </Badge>
                          </div>
                          <p className={`text-sm ${isWakanda ? "text-green-100/60" : "text-white/60"}`}>
                            SKU: {product.sku}
                          </p>
                          <div
                            className={`flex items-center space-x-4 mt-2 text-sm ${
                              isWakanda ? "text-green-100/70" : "text-white/70"
                            }`}
                          >
                            <span>Stock: {product.stock}</span>
                            <span>Price: R$ {product.price.toFixed(2)}</span>
                            <span>Last sync: {new Date(product.lastSync).toLocaleString("pt-BR")}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${
                              isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""
                            }`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`border-white/20 text-white hover:bg-white/10 bg-transparent ${
                              isWakanda ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : ""
                            }`}
                          >
                            <Scan className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="barcode" className="space-y-6">
            <Card
              className={`bg-white/5 border-white/10 backdrop-blur-sm ${
                isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white">Barcode Scanner</CardTitle>
                <CardDescription className="text-white/70">
                  Future integration with Android barcode scanning
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Scan className={`h-16 w-16 mx-auto mb-4 ${isWakanda ? "text-green-400" : "text-purple-400"}`} />
                <h3 className={`${isWakanda ? "text-green-100" : "text-white"} text-lg font-medium mb-2`}>
                  Coming Soon
                </h3>
                <p className={`${isWakanda ? "text-green-100/60" : "text-white/60"} mb-6`}>
                  Android barcode scanning integration will be available in the next update
                </p>
                <Badge
                  className={`${
                    isWakanda
                      ? "bg-green-600/20 text-green-300 border-green-500/30"
                      : "bg-blue-600/20 text-blue-300 border-blue-500/30"
                  }`}
                >
                  In Development
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card
              className={`bg-white/5 border-white/10 backdrop-blur-sm ${
                isWakanda ? "bg-green-950/20 border-green-500/20 wakanda-border" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                <CardDescription className="text-white/70">Inventory insights and trends</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-white/60 mb-6">Detailed analytics and reporting features coming soon</p>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">Planned Feature</Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
