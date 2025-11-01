"use client"

import { useState, useEffect } from "react"
import { VisitorHeader } from "@/components/visitor-header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Grid, List, GitCompare, X } from "lucide-react"
import { categories, fetchProducts, type Product } from "@/lib/products"
import Link from "next/link"

export default function CatalogPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [compareProducts, setCompareProducts] = useState<string[]>([])
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const list = await fetchProducts({ q: searchQuery || undefined, category: selectedCategory || undefined })
      setItems(list)
    } finally {
      setLoading(false)
    }
  }

  // load when query or category changes
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory])

  const handleCompareToggle = (productId: string) => {
    setCompareProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else if (prev.length < 3) {
        return [...prev, productId]
      }
      return prev
    })
  }

  const getComparedProducts = () => items.filter((p) => compareProducts.includes(p.id))

  return (
    <div className="min-h-screen bg-background">
      {user ? <Navigation centered /> : <VisitorHeader />}

      <main className="container mx-auto py-8 px-4">
        {user?.role === 'admin' && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are in <span className="font-medium">View Only</span> mode as an administrator. Some actions are restricted.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-4">Product Catalog</h1>
          <p className="text-lg text-muted-foreground">Discover our wide range of electronics and IT solutions</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="h-auto py-2"
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="h-auto py-2"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {compareProducts.length > 0 && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GitCompare className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">Compare Products ({compareProducts.length}/3)</span>
                  <div className="flex space-x-2">
                    {getComparedProducts().map((product) => (
                      <Badge key={product.id} variant="secondary" className="flex items-center space-x-1">
                        <span>{product.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => handleCompareToggle(product.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" disabled={compareProducts.length < 2} asChild={compareProducts.length >= 2}>
                    {compareProducts.length >= 2 ? (
                      <Link href={`/compare?products=${compareProducts.join(",")}`}>Compare Now</Link>
                    ) : (
                      "Select 2+ products"
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCompareProducts([])}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {loading ? "Loading products…" : `Showing ${items.length} products`}
            {selectedCategory && (
              <Badge variant="secondary" className="ml-2">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="ml-2">
                Search: "{searchQuery}"
              </Badge>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {items.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {items.map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-sm">
                    <Checkbox
                      id={`compare-${product.id}`}
                      checked={compareProducts.includes(product.id)}
                      onCheckedChange={() => handleCompareToggle(product.id)}
                      disabled={!compareProducts.includes(product.id) && compareProducts.length >= 3}
                    />
                    <label htmlFor={`compare-${product.id}`} className="text-xs font-medium cursor-pointer">
                      Compare
                    </label>
                  </div>
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
