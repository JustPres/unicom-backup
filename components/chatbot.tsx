"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type Product } from "@/lib/products"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  products?: Product[]
}

export function Chatbot() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  // Hide chatbot on login pages and all admin pages
  if (pathname === "/login" || pathname?.startsWith("/admin")) {
    return null
  }

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I can help you browse the catalog, get a quote, or navigate the site.",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  // Quick suggestions
  const suggestions = useMemo(
    () => [
      { label: "Browse Catalog", text: "Go to catalog" },
      { label: "Get Quote", text: "I want a quote" },
      { label: "My Quotes", text: "Show my quotes" },
      { label: "Support", text: "Contact support" },
    ],
    [],
  )

  // Load persisted chat
  useEffect(() => {
    try {
      // For authenticated users, use localStorage (persists across sessions)
      // For guests, use sessionStorage (clears when browser closes)
      const storage = user ? localStorage : sessionStorage
      const raw = storage.getItem("chatbot_messages")
      if (raw) {
        const parsed: Message[] = JSON.parse(raw)
        // Revive timestamps
        setMessages(parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })))
      }
    } catch { }
  }, [user])

  // Persist chat and auto-scroll on change
  useEffect(() => {
    try {
      const storage = user ? localStorage : sessionStorage
      storage.setItem(
        "chatbot_messages",
        JSON.stringify(
          messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() })),
        ),
      )
    } catch { }
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages, typing, user])

  // Clear chat history when user logs out
  useEffect(() => {
    if (!user) {
      // User logged out, clear any previous authenticated chat
      localStorage.removeItem("chatbot_messages")
      // Reset to welcome message only if currently has user-specific data
      setMessages([{
        id: "1",
        text: "Hi! I can help you browse the catalog, get a quote, or navigate the site.",
        isBot: true,
        timestamp: new Date(),
      }])
    }
  }, [user])

  const pushMessage = (text: string, isBot: boolean, products?: Product[]) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, isBot, timestamp: new Date(), products },
    ])
  }

  const handleIntent = async (raw: string) => {
    const input = raw.trim()
    const lower = input.toLowerCase()

    // Navigation intents (Client-side fast path)
    if (/(^|\b)(dashboard)\b/.test(lower)) {
      pushMessage("Opening dashboard…", true)
      router.push("/dashboard")
      return
    }
    if (/\bcatalog\b|\bproducts?\b/.test(lower)) {
      pushMessage("Taking you to the catalog…", true)
      router.push("/catalog")
      return
    }
    if (/\bquote\b|\bpricing\b|\bquotation\b/.test(lower)) {
      pushMessage("Let’s start a quote request…", true)
      router.push("/quote")
      return
    }
    if (/\bmy quotes\b|\bquotes\b/.test(lower)) {
      pushMessage("Opening your quotes…", true)
      router.push("/quotes")
      return
    }

    // Call LLM API for everything else
    try {
      // Prepare history for the API (exclude the current user message which is already in 'input' but not in 'messages' state yet? 
      // Actually 'messages' state is updated via pushMessage BEFORE this runs? No, pushMessage is called in send() before handleIntent.
      // So 'messages' includes the latest user message.

      // We need to filter out the latest message to avoid duplication if we are sending it separately, 
      // OR just send the history excluding the very last one if the API expects "history + new message".
      // My API route expects { message, history }.

      const history = messages.map(m => ({
        role: m.isBot ? "model" : "user",
        text: m.text,
        isBot: m.isBot
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: history,
          user: user // Send user context for RBAC
        }),
      })

      if (!res.ok) throw new Error("API Error")

      const data = await res.json()

      // Add bot response
      pushMessage(data.text, true, data.products)

    } catch (error) {
      console.error(error)
      pushMessage("I'm having trouble connecting right now. Please try again.", true)
    }
  }

  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const send = async () => {
    if (!input.trim() || cooldown > 0) return
    const text = input
    setInput("")
    setCooldown(3) // 3 seconds cooldown
    pushMessage(text, false)
    setTyping(true)

    // Small delay to allow UI to update before heavy API call if needed, 
    // though not strictly necessary for the cooldown logic itself.
    setTimeout(async () => {
      await handleIntent(text)
      setTyping(false)
    }, 100)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="h-14 w-14 rounded-full shadow-lg" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <SheetTitle>Unicom Assistant</SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100vh-6rem)] flex-col">
            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 py-3 gap-2 flex flex-wrap">
                {suggestions.map((s) => (
                  <Button key={s.text} variant="outline" size="sm" onClick={() => setInput(s.text)}>
                    {s.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div ref={viewportRef} className="flex-1 overflow-y-auto px-4 py-3">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.isBot ? "bg-muted text-foreground" : "bg-emerald-600 text-white"
                        }`}
                    >
                      <div>{m.text}</div>
                      {m.products && m.products.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          {m.products.map((p) => (
                            <div key={p.id} className="border rounded-md p-2 bg-background">
                              <div className="text-sm font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.brand}</div>
                              <div className="text-xs mt-1">{p.inStock ? "In stock" : "Out of stock"}</div>
                              <div className="mt-2">
                                <Link href={`/catalog`} className="text-emerald-600 text-xs underline">View in catalog</Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={`mt-1 text-[10px] opacity-70 ${m.isBot ? "text-foreground" : "text-white"}`}>
                        {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground max-w-[85%] rounded-2xl px-3 py-2 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce [animation-delay:120ms]">•</span>
                        <span className="animate-bounce [animation-delay:240ms]">•</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex gap-2 items-end">
                <textarea
                  rows={1}
                  placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Type a message…"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void send()
                    }
                  }}
                  className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
                  disabled={cooldown > 0}
                />
                <Button size="icon" onClick={send} disabled={!input.trim() || cooldown > 0}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick links under input */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Link href="/catalog" className="underline text-muted-foreground hover:text-foreground">Catalog</Link>
                <Link href="/quote" className="underline text-muted-foreground hover:text-foreground">Get Quote</Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
