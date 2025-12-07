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

        // Check if user exists in the database
        const user = await users.findOne<{
            id: string;
            email: string;
            name: string;
            password_hash: string;
            role: "admin" | "customer";
            email_verified?: boolean;
        }>({ email })

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash)
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Check if email is verified
        if (user.email_verified === false) {
            return NextResponse.json(
                {
                    error: "Please verify your email before logging in. Check your inbox for the verification link.",
                    code: "EMAIL_NOT_VERIFIED"
                },
                { status: 403 }
            )
        }


        // Return user data without the password hash
        const { password_hash, ...userWithoutPassword } = user as any

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })

        // Persist user role for admin route protection
        response.cookies.set({
            name: 'user-role',
            value: user.role,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
        })

        return response
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.flatten() }, { status: 400 })
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
