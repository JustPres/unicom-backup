'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesChart } from "@/components/charts/sales-chart"
import { RevenueTrend } from "@/components/charts/revenue-trend"
import { CategoryChart } from "@/components/charts/category-chart"
import { KpiGrid } from "./kpi-card"

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/analytics/overview')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-background border rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
        </div>
      </div>

      <KpiGrid data={data} />

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Track your sales performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Revenue vs. targets and growth</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueTrend />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Breakdown of sales across product categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CategoryChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products by sales</CardDescription>
              </CardHeader>
              <CardContent>
                {data?.products?.topSelling?.length > 0 ? (
                  <div className="space-y-4">
                    {data.products.topSelling.map((product: any) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${product.price?.toFixed(2)} • {product.sold || 0} sold
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ${(product.price * (product.sold || 0)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No product data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quote Status</CardTitle>
            <CardDescription>Distribution of quotes by status</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.quotes?.total > 0 ? (
              <div className="space-y-2">
                {Object.entries(data.quotes.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{count as number}</span>
                      <span className="text-muted-foreground">
                        {Math.round((count as number / data.quotes.total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No quote data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>Current ticket status</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.tickets?.total > 0 ? (
              <div className="space-y-2">
                {Object.entries(data.tickets.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{count as number}</span>
                      <span className="text-muted-foreground">
                        {Math.round((count as number / data.tickets.total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No support ticket data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
