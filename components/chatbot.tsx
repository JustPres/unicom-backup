"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { searchProducts, type Product } from "@/lib/products"
import { getFaqAnswer } from "@/lib/faq"
import Link from "next/link"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  products?: Product[]
}

export function Chatbot() {
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
      const raw = localStorage.getItem("chatbot_messages")
      if (raw) {
        const parsed: Message[] = JSON.parse(raw)
        // Revive timestamps
        setMessages(parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })))
      }
    } catch {}
  }, [])

  // Persist chat and auto-scroll on change
  useEffect(() => {
    try {
      localStorage.setItem(
        "chatbot_messages",
        JSON.stringify(
          messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() })),
        ),
      )
    } catch {}
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages, typing])

  const pushMessage = (text: string, isBot: boolean, products?: Product[]) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, isBot, timestamp: new Date(), products },
    ])
  }

  const handleIntent = async (raw: string) => {
    const input = raw.trim()
    const lower = input.toLowerCase()

    // Navigation intents
    if (/(^|\b)(dashboard)\b/.test(lower)) {
      pushMessage("Opening dashboard…", true)
      window.location.href = "/dashboard"
      return
    }
    if (/\bcatalog\b|\bproducts?\b/.test(lower)) {
      pushMessage("Taking you to the catalog…", true)
      window.location.href = "/catalog"
      return
    }
    if (/\bquote\b|\bpricing\b|\bquotation\b/.test(lower)) {
      pushMessage("Let’s start a quote request…", true)
      window.location.href = "/quote"
      return
    }
    if (/\bmy quotes\b|\bquotes\b/.test(lower)) {
      pushMessage("Opening your quotes…", true)
      window.location.href = "/quotes"
      return
    }
    if (/\bsupport\b|\bhelp\b/.test(lower)) {
      pushMessage("Taking you to support…", true)
      window.location.href = "/support"
      return
    }

    // Product search: patterns like "search ssd", "find router"
    const searchMatch = lower.match(/^(search|find)\s+(.+)/)
    if (searchMatch) {
      const term = searchMatch[2]
      const results = searchProducts(term).slice(0, 5)
      if (results.length === 0) {
        pushMessage(`No results for "${term}". Try another keyword.`, true)
      } else {
        const header = `Top results for "${term}":`
        pushMessage(header, true, results)
      }
      return
    }

    // FAQ knowledge base
    const faq = getFaqAnswer(input)
    if (faq) {
      pushMessage(faq, true)
      return
    }

    // Default fallback
    pushMessage(
      "I can help you navigate the site and do quick lookups. Try: ‘Go to catalog’, ‘I want a quote’, or ‘search router’.",
      true,
    )
  }

  const send = async () => {
    if (!input.trim()) return
    const text = input
    setInput("")
    pushMessage(text, false)
    setTyping(true)
    setTimeout(async () => {
      await handleIntent(text)
      setTyping(false)
    }, 500)
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
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.isBot ? "bg-muted text-foreground" : "bg-emerald-600 text-white"
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
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void send()
                    }
                  }}
                  className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none"
                />
                <Button size="icon" onClick={send} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick links under input */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Link href="/catalog" className="underline text-muted-foreground hover:text-foreground">Catalog</Link>
                <Link href="/quote" className="underline text-muted-foreground hover:text-foreground">Get Quote</Link>
                <Link href="/support" className="underline text-muted-foreground hover:text-foreground">Support</Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
