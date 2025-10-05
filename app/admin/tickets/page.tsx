"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { SupportTicket } from "@/lib/tickets"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [updateData, setUpdateData] = useState({
    status: "",
    adminNotes: "",
    assignedTo: "",
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets")
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

  const handleUpdateTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("Ticket updated successfully!")
        fetchTickets() // Refresh the list
        setSelectedTicket(null)
        setUpdateData({ status: "", adminNotes: "", assignedTo: "" })
      } else {
        toast.error("Failed to update ticket")
      }
    } catch (error) {
      toast.error("Failed to update ticket")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation centered />
      
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-2">Manage customer support requests</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No support tickets found.</p>
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
                        From: {ticket.customerName} ({ticket.customerEmail})
                      </p>
                      <p className="text-sm text-gray-600">
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
                  <p className="text-gray-700 mb-4">{ticket.description}</p>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setUpdateData({
                              status: ticket.status,
                              adminNotes: ticket.adminNotes || "",
                              assignedTo: ticket.assignedTo || "",
                            })
                          }}
                        >
                          Update Ticket
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Ticket</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select
                              value={updateData.status}
                              onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Admin Notes</label>
                            <Textarea
                              value={updateData.adminNotes}
                              onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                              placeholder="Add admin notes..."
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Assigned To</label>
                            <Select
                              value={updateData.assignedTo}
                              onValueChange={(value) => setUpdateData({ ...updateData, assignedTo: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin1">Admin 1</SelectItem>
                                <SelectItem value="admin2">Admin 2</SelectItem>
                                <SelectItem value="support">Support Team</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button 
                            onClick={() => handleUpdateTicket(ticket.id)}
                            className="w-full"
                          >
                            Update Ticket
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
