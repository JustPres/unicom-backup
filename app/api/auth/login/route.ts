import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/db"

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = LoginSchema.parse(body)

        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const users = db.collection("users")
        const row = await users.findOne<{ id: string; email: string; name: string; password_hash: string; role: "admin" | "customer" }>({ email })
        if (!row) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const ok = await bcrypt.compare(password, row.password_hash)
        if (!ok) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const { password_hash: _, ...user } = row as any
        return NextResponse.json({ user })
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten() }, { status: 400 })
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


