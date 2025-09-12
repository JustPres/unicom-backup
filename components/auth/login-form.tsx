"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    console.log("[v0] Customer login attempt with:", { email, password })

    const success = await login(email, password)
    console.log("[v0] Login result:", success)

    if (success) {
      const storedUser = localStorage.getItem("unicom_user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.role === "admin") {
          setError("Admin users should use the Admin Portal. Redirecting...")
          setTimeout(() => {
            router.push("/admin/login")
          }, 2000)
          return
        }
      }
      console.log("[v0] Customer login successful, redirecting to dashboard")
      router.push("/dashboard")
    } else {
      console.log("[v0] Login failed")
      setError("Invalid email or password")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Customer Login</CardTitle>
        <CardDescription className="text-center">
          Sign in to your customer account to browse products and manage orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs">
              Admin user?{" "}
              <Link href="/admin/login" className="text-primary hover:underline">
                Use Admin Portal
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
