import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "@/lib/db"
import { z } from "zod"
import { randomUUID } from "crypto"

const createTicketSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  subject: z.string().min(1),
  issueType: z.enum(["technical", "billing", "general", "product", "other"]),
  description: z.string().min(5, "Description must be at least 5 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== TICKET CREATION START ===")
    const body = await request.json()
    console.log("Request body:", body)
    
    const validatedData = createTicketSchema.parse(body)
    console.log("Validated data:", validatedData)
    
    const tickets = await getTicketsCollection()
    console.log("Got tickets collection")
    
    const ticket = {
      ...validatedData,
      id: randomUUID(),
      status: "open" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    console.log("Created ticket object:", ticket)
    
    const result = await tickets.insertOne(ticket)
    console.log("Insert result:", result)
    
    console.log("=== TICKET CREATION SUCCESS ===")
    return NextResponse.json({ success: true, ticket, insertId: result.insertedId })
  } catch (error) {
    console.error("=== TICKET CREATION ERROR ===")
    console.error("Error type:", typeof error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    console.error("Full error:", error)
    
    return NextResponse.json({ 
      error: "Failed to create ticket", 
      details: error instanceof Error ? error.message : "Unknown error",
      type: typeof error
    }, { status: 500 })
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
