// Simple FAQ knowledge base and matcher
export interface FAQ {
  question: string
  answer: string
  keywords: string[]
}

export const faqs: FAQ[] = [
  {
    question: "How do I request a quote?",
    answer:
      "Go to the Get Quote page and describe your requirements. You can also tell the chatbot 'I want a quote' and it will take you there.",
    keywords: ["quote", "pricing", "quotation", "price"],
  },
  {
    question: "Do you ship nationwide?",
    answer:
      "Yes, we provide delivery options depending on your location. Shipping fees and lead times vary. For specifics, contact Support.",
    keywords: ["ship", "shipping", "delivery", "nationwide"],
  },
  {
    question: "How can I track my quotes or orders?",
    answer: "Customers can view and track their requests from the Dashboard or the My Quotes page.",
    keywords: ["track", "status", "order", "quote", "dashboard", "my quotes"],
  },
  {
    question: "How do I contact support?",
    answer: "Visit the Support page for options, or ask the chatbot to take you there.",
    keywords: ["support", "help", "contact"],
  },
]

// Very simple keyword-based matcher: picks the FAQ with the most keyword matches
export function getFaqAnswer(query: string): string | null {
  const q = query.toLowerCase()
  let best: { faq: FAQ; score: number } | null = null
  for (const faq of faqs) {
    const score = faq.keywords.reduce((acc, kw) => (q.includes(kw) ? acc + 1 : acc), 0)
    if (score > 0 && (!best || score > best.score)) {
      best = { faq, score }
    }
  }
  return best ? `${best.faq.answer}` : null
}
