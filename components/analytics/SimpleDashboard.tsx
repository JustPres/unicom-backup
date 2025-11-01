'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, Line } from "react-chartjs-2"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardData {
  sales: {
    daily: Array<{ date: string; total: number; count: number }>
    total: number
    orderCount: number
  }
  customers: {
    total: number
    newThisMonth: number
  }
  quotes: {
    byStatus: Record<string, number>
    total: number
  }
  tickets: {
    byStatus: Record<string, number>
    total: number
  }
  products: {
    mostQuoted: Array<{
      _id: string
      name: string
      price: number
      quoteCount: number
      totalQuotedValue: number
    }>
  }
}

interface SimpleDashboardProps {
  data: DashboardData | null
}

export function SimpleDashboard({ data }: SimpleDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Log the data structure for debugging
  useEffect(() => {
    if (data) {
      console.log('Rendering with data:', {
        hasProducts: !!data.products,
        hasMostQuoted: !!data.products?.mostQuoted,
        mostQuotedLength: data.products?.mostQuoted?.length,
        products: data.products
      })
    }
  }, [data])

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>No analytics data is currently available.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const {
    sales = { daily: [], total: 0, orderCount: 0 },
    customers = { total: 0, newThisMonth: 0 },
    quotes = { byStatus: {}, total: 0 },
    tickets = { byStatus: {}, total: 0 },
    products = { mostQuoted: [] }
  } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${sales.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {sales.orderCount} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{customers.newThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotes</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {quotes.byStatus.pending || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">🎫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {tickets.byStatus.open || 0} open, {tickets.byStatus['in-progress'] || 0} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Most Quoted Products */}
      {products.mostQuoted && products.mostQuoted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Quoted Products</CardTitle>
            <CardDescription>Products with the most quote requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.mostQuoted.map((product) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${product.price?.toFixed(2) || 'Price not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {product.quoteCount} {product.quoteCount === 1 ? 'quote' : 'quotes'}
                    </p>
                    {product.totalQuotedValue !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        ${product.totalQuotedValue.toLocaleString()} total quoted
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
