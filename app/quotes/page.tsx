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
import { Search, Eye, CheckCircle, XCircle, Clock, FileText, Plus } from "lucide-react"
import type { Quote } from "@/lib/quotes"
import Link from "next/link"

export default function AdminQuotesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchQuotes()
    }
  }, [user])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setQuotesLoading(false)
    }
  }

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.company?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const updateQuoteStatus = async (quoteId: string, status: Quote["status"]) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        await fetchQuotes() // Refresh the list
      }
    } catch (error) {
      console.error("Error updating quote status:", error)
    }
  }

  if (loading || quotesLoading) {
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
      <Navigation />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Quote Management</h1>
            <p className="text-muted-foreground mt-2">Manage customer quote requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {quotes.filter((q) => q.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {quotes.filter((q) => q.status === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${quotes.reduce((sum, q) => sum + q.totalAmount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Quote Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
                <p className="text-muted-foreground">
                  {quotes.length === 0
                    ? "No quote requests have been submitted yet."
                    : "No quotes match your search criteria."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#{quote.id.slice(0, 8)}</TableCell>
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
                      <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {quote.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuoteStatus(quote.id, "approved")}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuoteStatus(quote.id, "rejected")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}