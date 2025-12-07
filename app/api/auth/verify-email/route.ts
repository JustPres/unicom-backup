import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

// Force dynamic rendering since this route uses request.url
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json(
                { error: "Verification token is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const users = db.collection("users")

        // Find user by verification token
        const user = await users.findOne({ verification_token: token })

        if (!user) {
            // Token not found - could be already used or invalid
            // Check if there's a user with this token who is already verified
            // Since we delete the token after verification, we need to be helpful
            return NextResponse.json(
                {
                    success: true,
                    message: "This verification link has already been used. If you've verified your email, you can proceed to login!",
                    alreadyVerified: true
                },
                { status: 200 }
            )
        }

        // Check if already verified (shouldn't happen, but just in case)
        if (user.email_verified) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Email already verified. You can now log in.",
                    alreadyVerified: true
                },
                { status: 200 }
            )
        }

        // Check if token is expired
        const now = new Date()
        if (user.verification_expires && new Date(user.verification_expires) < now) {
            return NextResponse.json(
                { error: "Verification token has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Update user: mark as verified and remove verification fields
        await users.updateOne(
            { verification_token: token },
            {
                $set: { email_verified: true },
                $unset: { verification_token: "", verification_expires: "" },
            }
        )

        return NextResponse.json(
            {
                success: true,
                message: "Email verified successfully! You can now log in.",
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Email verification error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
