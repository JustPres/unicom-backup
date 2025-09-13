"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ShoppingCart, Users, TrendingUp, Package, Plus } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === "admin"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "Manage your store and track performance" : "Track your orders and manage your account"}
          </p>
          <Badge variant={isAdmin ? "default" : "secondary"} className="mt-2">
            {isAdmin ? "Administrator" : "Customer"}
          </Badge>
        </div>

        {isAdmin ? <AdminDashboard /> : <CustomerDashboard />}
      </main>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your store efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button className="h-20 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <ShoppingCart className="h-6 w-6" />
              <span>View Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomerDashboard() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)

  useEffect(() => {
    fetchRecentQuotes()
  }, [])

  const fetchRecentQuotes = async () => {
    try {
      const response = await fetch(`/api/quotes?customerEmail=${encodeURIComponent(user?.email || "")}`)
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes.slice(0, 3)) // Get only recent 3
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setQuotesLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quote Requests</CardTitle>
          <CardDescription>Track your recent quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          {quotesLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No quote requests yet.</p>
              <Button asChild className="mt-4">
                <Link href="/quote">Request Your First Quote</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Quote #{quote.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.items.length} items • ${quote.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={quote.status === "approved" ? "default" : "secondary"}>
                    {quote.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button className="h-20 flex-col space-y-2">
              <ShoppingCart className="h-6 w-6" />
              <span>Browse Catalog</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Package className="h-6 w-6" />
              <span>Track Orders</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
