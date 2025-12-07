import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

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

        // Check if email already exists
        const existing = await users.findOne({ email })
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)
        const id = crypto.randomUUID()

        // Generate verification token
        const verificationToken = crypto.randomUUID()
        const verificationExpires = new Date()
        verificationExpires.setHours(verificationExpires.getHours() + 24) // Token expires in 24 hours

        // Insert user with verification fields
        await users.insertOne({
            id,
            email,
            name,
            password_hash: passwordHash,
            role,
            created_at: new Date(),
            email_verified: false,
            verification_token: verificationToken,
            verification_expires: verificationExpires,
        })

        // Send verification email
        try {
            await sendVerificationEmail({
                email,
                name,
                token: verificationToken,
            })
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError)
            // Delete the user if email sending fails to prevent orphaned accounts
            await users.deleteOne({ id })
            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            )
        }

        // Return success without user object (don't log them in)
        return NextResponse.json(
            {
                success: true,
                message: "Registration successful! Please check your email to verify your account.",
            },
            { status: 201 }
        )
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten() }, { status: 400 })
        }
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


