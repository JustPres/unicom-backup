import { NextResponse } from "next/server"
import { z } from "zod"
import clientPromise from "@/lib/db"
import type { Quote, QuoteItem } from "@/lib/quotes"

const QuoteItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    customSpecs: z.string().optional(),
})

const CreateQuoteSchema = z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    company: z.string().optional(),
    phone: z.string().optional(),
    items: z.array(QuoteItemSchema).min(1),
    notes: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customerName, customerEmail, company, phone, items, notes } = CreateQuoteSchema.parse(body)

        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const quotes = db.collection("quotes")

        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        const id = crypto.randomUUID()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

        const quote: Quote = {
            id,
            customerName,
            customerEmail,
            company,
            phone,
            items,
            totalAmount,
            status: "pending",
            notes,
            createdAt: now,
            expiresAt,
        }

        await quotes.insertOne(quote)

        return NextResponse.json({ quote }, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten() }, { status: 400 })
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const customerEmail = searchParams.get("customerEmail")
        const status = searchParams.get("status")

        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const quotes = db.collection("quotes")

        let filter: any = {}
        if (customerEmail) {
            filter.customerEmail = customerEmail
        }
        if (status) {
            filter.status = status
        }

        const quotesList = await quotes.find(filter).sort({ createdAt: -1 }).toArray()
        return NextResponse.json({ quotes: quotesList })
    } catch (error: unknown) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
