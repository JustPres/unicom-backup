import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "@/lib/db"
import { z } from "zod"

const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  adminNotes: z.string().optional(),
  assignedTo: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateTicketSchema.parse(body)
    
    const tickets = await getTicketsCollection()
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    }
    
    if (validatedData.status === "resolved") {
      updateData.resolvedAt = new Date()
    }
    if (validatedData.status === "closed") {
      updateData.closedAt = new Date()
    }
    
    const result = await tickets.updateOne(
      { id: params.id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tickets = await getTicketsCollection()
    const ticket = await tickets.findOne({ id: params.id })
    
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    
    return NextResponse.json({ ticket })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
  }
}
