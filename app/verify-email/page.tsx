"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react"

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token")

            if (!token) {
                setStatus("error")
                setMessage("Invalid verification link. Please check your email and try again.")
                return
            }

            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`)
                const data = await res.json()

                if (res.ok) {
                    setStatus("success")
                    setMessage(data.message || "Email verified successfully!")
                } else {
                    setStatus("error")
                    // Provide helpful context for common errors
                    if (data.error?.includes("Invalid verification token")) {
                        setMessage("This verification link is invalid or has already been used. If you've already verified your email, you can proceed to login!")
                    } else if (data.error?.includes("expired")) {
                        setMessage("This verification link has expired. Please register again to receive a new verification email.")
                    } else {
                        setMessage(data.error || "Verification failed. Please try again.")
                    }
                }
            } catch (error) {
                setStatus("error")
                setMessage("An error occurred during verification. Please try again.")
            }
        }

        verifyEmail()
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {status === "loading" && <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />}
                        {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-600" />}
                        {status === "error" && <XCircle className="h-16 w-16 text-red-600" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === "loading" && "Verifying Your Email..."}
                        {status === "success" && "Email Verified!"}
                        {status === "error" && "Verification Failed"}
                    </CardTitle>
                    <CardDescription>
                        {status === "loading" && "Please wait while we verify your email address."}
                        {status === "success" && "Your account has been successfully verified."}
                        {status === "error" && "We couldn't verify your email address."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === "success" && (
                        <Alert className="border-green-500 bg-green-50 text-green-900">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    {status === "error" && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    {status === "success" && (
                        <div className="space-y-3">
                            <Button onClick={() => router.push("/login")} className="w-full" size="lg">
                                Go to Login
                            </Button>
                            <p className="text-center text-sm text-gray-600">
                                You can now log in with your credentials.
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-3">
                            <Button onClick={() => router.push("/login")} className="w-full">
                                Try Login
                            </Button>
                            <Button onClick={() => router.push("/register")} className="w-full" variant="outline">
                                Back to Registration
                            </Button>
                            <p className="text-center text-sm text-gray-600">
                                Already verified? Try logging in. Otherwise, register again.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
