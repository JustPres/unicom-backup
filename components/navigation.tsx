"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Navigation({ centered = false }: { centered?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!href) return false
    // Special case: for customers, highlight Dashboard when on customer home
    if (user?.role === "customer" && href === "/dashboard") {
      if (pathname === "/customer/home") return true
    }
    // Treat exact match or path starting with href as active for nested routes
    return pathname === href || pathname.startsWith(href + "/")
  }

  const getNavItems = () => {
    if (!user) {
      // Visitor navigation
      return [
        { href: "/", label: "Home" },
        { href: "/catalog", label: "Catalog" },
        { href: "/services", label: "Services" },
        { href: "/support", label: "Support" },
        { href: "/about", label: "About" },
      ]
    } else if (user.role === "customer") {
      // Customer navigation
      return [
        { href: "/customer/home", label: "Home" },
        { href: "/catalog", label: "Catalog" },
        { href: "/quote", label: "Get Quote" },
        { href: "/customer/quotes", label: "My Quotes" },
        { href: "/support", label: "Support" },
        { href: "/dashboard", label: "Dashboard" },
      ]
    } else {
      // Admin navigation
      return [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/catalog", label: "Catalog" },
        { href: "/quotes", label: "Quotes" },
        { href: "/analytics", label: "Analytics" },
        { href: "/inventory", label: "Inventory" },
      ]
    }
  }

  const navItems = getNavItems()

  const handleLogout = () => {
    console.log("[v0] Logout button clicked")
    logout()
    // Use router.push for better navigation
    window.location.href = "/"
  }

  console.log("[v0] Navigation render - user:", user)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`container relative flex h-16 items-center ${centered ? "justify-center" : "justify-between"}`}>
        {/* Logo */}
        {!centered && (
          <Link
            href={user ? (user.role === "customer" ? "/customer/home" : "/dashboard") : "/"}
            className="flex items-center space-x-2"
          >
            {user?.role !== "customer" && (
              <>
                <div className="h-8 w-8 rounded bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <div>
                  <span className="font-bold text-lg">Unicom</span>
                  <span className="text-sm text-muted-foreground ml-1">Technologies</span>
                </div>
              </>
            )}
          </Link>
        )}

        {/* Desktop Navigation */}
        <nav className={`hidden md:flex items-center space-x-6 ${centered ? "mx-auto" : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-emerald-600 ${isActive(item.href) ? "text-emerald-600" : "text-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        {!centered && (
          <div className="flex items-center space-x-4">
            {user ? (
              user.role === 'customer' ? (
                <div className="text-sm md:text-base text-muted-foreground">
                  <span className="hidden sm:inline">Welcome, </span>
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
              ) : (
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("Profile dropdown clicked")
                        }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-100 text-emerald-600">
                            {(user?.name?.[0]?.toUpperCase() ?? 'U')}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 z-[100] mt-1 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      align="end"
                      side="bottom"
                      sideOffset={8}
                    >
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user?.name ?? 'User'}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email ?? ''}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Customer Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/login" className="text-xs">
                    Admin
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Logout when centered (e.g., admin centered navbar) */}
        {centered && user && (
          <div className="absolute right-4">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-emerald-600 ${isActive(item.href) ? "text-emerald-600" : "text-foreground"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Customer Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                      Admin Portal
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

    </header>
  )
}
