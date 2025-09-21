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
      <Navigation centered />

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
      {/* Placeholder: add admin widgets here later */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>No widgets yet. Add admin modules here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This area will host KPIs, shortcuts, and recent activity once connected to real data.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomerDashboard() {
  const { user, logout } = useAuth()
  const [quotes, setQuotes] = useState<any[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)

  useEffect(() => {
    fetchRecentQuotes()
  }, [])

  const fetchRecentQuotes = async () => {
    try {
      console.log("Fetching quotes for user:", user?.email)
      const response = await fetch(`/api/quotes?customerEmail=${encodeURIComponent(user?.email || "")}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Quotes response:", data.quotes)
        setQuotes(data.quotes.slice(0, 3)) // Get only recent 3
      } else {
        console.error("Failed to fetch quotes:", response.status)
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

    </div>
  )
}
