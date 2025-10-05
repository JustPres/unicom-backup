import { NextRequest, NextResponse } from "next/server"
import { getTicketsCollection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("=== TESTING MONGODB CONNECTION ===")
    
    const tickets = await getTicketsCollection()
    console.log("Got tickets collection successfully")
    
    // Try to count documents
    const count = await tickets.countDocuments()
    console.log("Document count:", count)
    
    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connection successful",
      documentCount: count 
    })
  } catch (error) {
    console.error("=== MONGODB CONNECTION ERROR ===")
    console.error("Error:", error)
    
    return NextResponse.json({ 
      error: "MongoDB connection failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
