import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/db"

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(["admin", "customer"]).optional().default("customer"),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, name, role } = RegisterSchema.parse(body)

        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const users = db.collection("users")
        const existing = await users.findOne({ email })
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const id = crypto.randomUUID()

        await users.insertOne({ id, email, name, password_hash: passwordHash, role, created_at: new Date() })

        const user = { id, email, name, role }
        return NextResponse.json({ user }, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten() }, { status: 400 })
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


