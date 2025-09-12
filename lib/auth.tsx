// Simple authentication context and utilities
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("unicom_user")
      if (storedUser) {
        console.log("[v0] Found stored user:", storedUser)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.log("[v0] Error loading stored user:", error)
      localStorage.removeItem("unicom_user")
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("[v0] Login function called with:", { email, password })
    setLoading(true)

    // Simulate API call - replace with real authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const demoUsers: Array<{ id: string; email: string; password: string; name: string; role: "admin" | "customer" }> =
      [
        {
          id: "admin-1",
          email: "admin@unicom.com",
          password: "admin123",
          name: "Admin User",
          role: "admin",
        },
      ]

    const foundUser = demoUsers.find((u) => u.email === email && u.password === password)
    console.log("[v0] Found user:", foundUser)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      console.log("[v0] Setting user:", userWithoutPassword)
      setUser(userWithoutPassword)

      try {
        localStorage.setItem("unicom_user", JSON.stringify(userWithoutPassword))
        console.log("[v0] User saved to localStorage")
      } catch (error) {
        console.log("[v0] Error saving to localStorage:", error)
      }

      setLoading(false)
      return true
    }

    console.log("[v0] Login failed - user not found")
    setLoading(false)
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log("[v0] Register function called")
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role: "customer" as const,
    }

    setUser(newUser)

    try {
      localStorage.setItem("unicom_user", JSON.stringify(newUser))
      console.log("[v0] New user registered and saved")
    } catch (error) {
      console.log("[v0] Error saving new user:", error)
    }

    setLoading(false)
    return true
  }

  const logout = () => {
    console.log("[v0] Logout called")
    setUser(null)
    localStorage.removeItem("unicom_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
