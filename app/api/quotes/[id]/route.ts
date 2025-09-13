import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const quotes = db.collection("quotes")

        const quote = await quotes.findOne({ id: params.id })
        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 })
        }

        return NextResponse.json({ quote })
    } catch (error: unknown) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const quotes = db.collection("quotes")

        const result = await quotes.deleteOne({ id: params.id })
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        const { status, adminNotes } = body

        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const quotes = db.collection("quotes")

        const updateData: any = {}
        if (status) updateData.status = status
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes

        const result = await quotes.updateOne({ id: params.id }, { $set: updateData })
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
