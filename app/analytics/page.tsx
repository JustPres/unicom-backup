"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesChart } from "@/components/charts/sales-chart"
import { CategoryChart } from "@/components/charts/category-chart"
import { RevenueTrend } from "@/components/charts/revenue-trend"
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign } from "lucide-react"

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
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

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your business performance and insights</p>
        </div>

        {/* Placeholder: integrate real analytics here */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              No analytics connected yet. Hook up your data source to populate this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This space will render charts and KPIs when data is available.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
