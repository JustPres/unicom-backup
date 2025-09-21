"use client"

import { Suspense, useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X } from "lucide-react"
import { fetchProductsByIds, type Product } from "@/lib/products"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function CompareContent() {
  const searchParams = useSearchParams()
  const productIds = searchParams.get("products")?.split(",") || []
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const list = await fetchProductsByIds(productIds)
        if (!cancelled) setItems(list)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [productIds.join(",")])

  if (loading) {
    return <div className="text-center py-12">Loading comparison…</div>
  }

  const compareProducts = items

  if (compareProducts.length < 2) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No products to compare</h2>
        <p className="text-muted-foreground mb-6">Please select at least 2 products from the catalog</p>
        <Button asChild>
          <Link href="/catalog">Browse Catalog</Link>
        </Button>
      </div>
    )
  }

  const allSpecs = Array.from(new Set(compareProducts.flatMap((p) => Object.keys(p.specifications || {}))))

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/catalog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-balance">Product Comparison</h1>
          <p className="text-lg text-muted-foreground">Compare {compareProducts.length} products side by side</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-full">
          {compareProducts.map((product) => (
            <Card key={product.id} className="min-w-[300px]">
              <CardHeader className="text-center">
                <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold text-emerald-600">${product.price}</span>
                  <Badge variant={product.inStock ? "default" : "secondary"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Specifications</h4>
                  <div className="space-y-2">
                    {allSpecs.map((spec) => (
                      <div key={spec} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{spec}:</span>
                        <span className="font-medium">
                          {product.specifications?.[spec] || <X className="h-4 w-4 text-muted-foreground" />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <Link href={`/catalog/${product.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />
      <main className="container mx-auto py-8 px-4">
        <Suspense fallback={<div>Loading comparison...</div>}>
          <CompareContent />
        </Suspense>
      </main>
    </div>
  )
}
