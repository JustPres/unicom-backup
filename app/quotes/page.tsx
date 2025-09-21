"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, CheckCircle, XCircle, Clock, FileText } from "lucide-react"
import { quotes } from "@/lib/quotes"
import type { Quote } from "@/lib/quotes"

export default function QuotesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const filteredQuotes = quotes.filter((quote) => {
    // For customers, only show their own quotes
    if (user?.role === "customer" && quote.customerEmail !== user.email) {
      return false
    }

    const matchesSearch =
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || quote.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: Quote["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "expired":
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: Quote["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "expired":
        return "outline"
      default:
        return "secondary"
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">
            {user.role === "admin" ? "Quote Management" : "My Quotes"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user.role === "admin" 
              ? "Manage customer quote requests and proposals" 
              : "View and track your quote requests"
            }
          </p>
        </div>

        {/* Removed demo stats cards */}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quote.customerName}</p>
                        <p className="text-sm text-muted-foreground">{quote.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{quote.company || "-"}</TableCell>
                    <TableCell>{quote.items.length} items</TableCell>
                    <TableCell className="font-medium">${quote.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quote.status)} className="capitalize">
                        {getStatusIcon(quote.status)}
                        <span className="ml-1">{quote.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{quote.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
