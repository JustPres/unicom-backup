"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cpu, LogIn } from "lucide-react"
import { usePathname } from "next/navigation"

export function VisitorHeader() {
  const pathname = usePathname()
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Unicom Technologies</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`transition-colors text-sm ${isActive("/") ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className={`transition-colors text-sm ${isActive("/catalog") ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Catalog
            </Link>
            <Link
              href="/services"
              className={`transition-colors text-sm ${isActive("/services") ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Services
            </Link>
            <Link
              href="/support"
              className={`transition-colors text-sm ${isActive("/support") ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Support
            </Link>
            <Link
              href="/about"
              className={`transition-colors text-sm ${isActive("/about") ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Customer Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
