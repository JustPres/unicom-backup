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
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      setUser(data.user)
      localStorage.setItem("unicom_user", JSON.stringify(data.user))
      return true
    } catch (e) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      if (!res.ok) return false
      const data = await res.json()
      setUser(data.user)
      localStorage.setItem("unicom_user", JSON.stringify(data.user))
      return true
    } catch (e) {
      return false
    } finally {
      setLoading(false)
    }
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
