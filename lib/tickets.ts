// Support ticket system data and utilities
export interface SupportTicket {
  id: string
  customerName: string
  customerEmail: string
  subject: string
  issueType: "technical" | "billing" | "general" | "product" | "other"
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed"
  attachments?: string[]
  adminNotes?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
}

export interface TicketUpdate {
  id: string
  status: "open" | "in_progress" | "resolved" | "closed"
  adminNotes?: string
  assignedTo?: string
  updatedAt: Date
}

export interface TicketNotification {
  id: string
  ticketId: string
  customerEmail: string
  message: string
  type: "status_update" | "admin_response" | "ticket_closed"
  read: boolean
  createdAt: Date
}

export const supportTickets: SupportTicket[] = []

export function getTicketById(id: string): SupportTicket | undefined {
  return supportTickets.find((ticket) => ticket.id === id)
}

export function getTicketsByCustomer(customerEmail: string): SupportTicket[] {
  return supportTickets.filter((ticket) => ticket.customerEmail === customerEmail)
}

export function getTicketsByStatus(status: SupportTicket["status"]): SupportTicket[] {
  return supportTickets.filter((ticket) => ticket.status === status)
}

export function getTicketsByPriority(priority: SupportTicket["priority"]): SupportTicket[] {
  return supportTickets.filter((ticket) => ticket.priority === priority)
}
