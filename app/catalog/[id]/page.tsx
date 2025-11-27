"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star, Share2, Quote, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { getProductById, type Product } from "@/lib/products"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      })
    } catch (err) {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const handleRequestQuote = () => {
    if (user?.role === 'admin') {
      toast.info('Admin mode: View only')
    } else {
      router.push(`/quote?productId=${product?.id}`)
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const p = await getProductById(params.id)
        if (!cancelled) setProduct(p ?? null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [params.id])

  return (
    <div className="min-h-screen bg-background">
      {user ? <Navigation centered /> : <Navigation />}

      <main className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">Loading product…</div>
        ) : !product ? (
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">Product not found</h2>
              <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {!product.inStock && (
                  <Badge variant="destructive" className="absolute top-4 right-4">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{product.brand}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews} reviews)</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-balance mb-4">{product.name}</h1>

                <p className="text-lg text-muted-foreground mb-6">{product.description}</p>

                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-4xl font-bold text-emerald-600">₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <Badge variant={product.inStock ? "default" : "destructive"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleRequestQuote}
                >
                  <Quote className="mr-2 h-5 w-5" />
                  Request Quote
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Quick Quote */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need a Custom Quote?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get personalized pricing for bulk orders or custom configurations
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    Request Quote
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Specifications */}
        {!loading && product?.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={key}>
                      <div className="flex justify-between py-2">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                      {index < Object.entries(product.specifications!).length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
