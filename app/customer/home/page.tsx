"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, TrendingUp, Star, Clock } from "lucide-react"
import { fetchProducts, categories, type Product } from "@/lib/products"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function CustomerHomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { logout } = useAuth()
  const [items, setItems] = useState<Product[]>([])

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchProducts()
        setItems(list)
      } catch (e) {
        // ignore for now
      }
    }
    void load()
  }, [])

  // Get featured products (first 6)
  const featuredProducts = items.slice(0, 6)

  // Get trending categories
  const trendingCategories = categories.slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />

      <main className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-4">Welcome to Your Electronics Hub</h1>
          <p className="text-lg text-muted-foreground mb-6">Discover the latest in technology and IT solutions</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <CardTitle>Browse Catalog</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Explore our full range of products</p>
              <Button asChild className="w-full">
                <Link href="/catalog">View Catalog</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Star className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <CardTitle>Get Quote</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Request custom pricing for your needs</p>
              <Button asChild className="w-full">
                <Link href="/quote">Request Quote</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <CardTitle>My Quotes</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">Track your quote requests</p>
              <Button asChild className="w-full">
                <Link href="/customer/quotes">View Quotes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="outline" asChild>
              <Link href="/catalog">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/catalog?category=${category.id}`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
