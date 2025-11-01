"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Plus, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { SupportTicket } from "@/lib/tickets"

export default function CustomerTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTickets()
    }
  }, [user])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/tickets?customerEmail=${user?.email}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation centered />
        <div className="container mx-auto py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Please log in to view your support tickets.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation centered />
      
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Support Tickets</h1>
            <p className="text-gray-600 mt-2">Track and manage your support requests</p>
          </div>
          <Link href="/support-ticket">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No support tickets found.</p>
              <Link href="/support-ticket">
                <Button>Create Your First Ticket</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{ticket.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Type: {ticket.issueType}</span>
                    <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.adminNotes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Admin Response:</p>
                      <p className="text-sm text-blue-800 mt-1">{ticket.adminNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
