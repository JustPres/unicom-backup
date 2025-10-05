import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "@/lib/db"
import { z } from "zod"

const createTicketSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  subject: z.string().min(1),
  issueType: z.enum(["technical", "billing", "general", "product", "other"]),
  description: z.string().min(10),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTicketSchema.parse(body)
    
    const tickets = await getTicketsCollection()
    
    const ticket = {
      ...validatedData,
      id: crypto.randomUUID(),
      status: "open" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    await tickets.insertOne(ticket)
    
    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get("customerEmail")
    const status = searchParams.get("status")
    
    const tickets = await getTicketsCollection()
    let query = {}
    
    if (customerEmail) {
      query = { customerEmail }
    }
    if (status) {
      query = { ...query, status }
    }
    
    const ticketList = await tickets.find(query).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json({ tickets: ticketList })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
