import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import Groq from "groq-sdk"
import clientPromise from "@/lib/db"
import { NextResponse } from "next/server"

// Initialize both AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

// Database helper functions
async function searchProductsFromDB(query: string) {
    try {
        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const products = db.collection("products")

        const results = await products.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        }).limit(5).toArray()

        return results.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            brand: p.brand,
            category: p.category,
            image: p.image,
            inStock: p.inStock
        }))
    } catch (error) {
        console.error("DB product search error:", error)
        return []
    }
}

async function getProductByIdFromDB(productId: string) {
    try {
        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const products = db.collection("products")

        const product = await products.findOne({ id: productId })
        if (!product) return null

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            brand: product.brand,
            category: product.category,
            image: product.image,
            inStock: product.inStock
        }
    } catch (error) {
        console.error("DB product get error:", error)
        return null
    }
}

// System instruction for both models
const SYSTEM_INSTRUCTION = `You are a comprehensive AI assistant for Unicom Technologies, Inc., a professional IT systems integrator. You can help with EVERYTHING related to products, quotes, support, and account management.

**ABOUT UNICOM TECHNOLOGIES:**
Unicom Technologies, Inc., established in February 2012, is an IT systems supplier that provides quality computer hardware and application software to small and medium-sized businesses (SMB) nationwide. We have steadily transformed from reselling into an "end-to-end" data center designer and project developer.

**OUR MISSION:** World-class systems integrator utilizing I.T. Best Practices to deliver cost-effective solutions
**OUR VISION:** To be recognized as a Unified Systems Integrator of Global Standards
**OUR VALUES:** Global Standards, Integrity, Innovation

**CONTACT:** Phone: (0925) 5000-493 | Email: dc.unicomtec@gmail.com | Office: 3F Unique Plaza, Highway Hills, Mandaluyong City

**YOUR COMPREHENSIVE CAPABILITIES:**

1. **CONVERSATIONAL PRODUCT DISCOVERY** - Act like a sales consultant:
   - When users say "I need something" or vague requests, DON'T immediately search
   - Instead, ask clarifying questions:
     * "What type of product?" (laptop, desktop, keyboard, monitor, etc.)
     * "Preferred brand?" (Dell, HP, Lenovo, Asus, Acer, etc.)
     * "Budget range?" (under 30k, 30-50k, 50-100k, 100k+)
     * "Use case?" (gaming, work/business, basic use, content creation)
   - Use their answers to search with specific terms
   - Be consultative and recommend based on their needs

2. **PRODUCT QUERIES** - When users ask about specific products:
   - "show me laptops", "I need a keyboard", "gaming monitors"
   - Always show products with details: name, price (in ₱), stock status
   - Proactively suggest alternatives if search yields few results
   - Ask if they want to request a quote

3. **QUOTE ASSISTANCE:**
   - Help users understand quotes and how to request them
   - Direct them to the Get Quote page at /quote
   - Explain the quote process

4. **GENERAL HELP:**
   - Navigate the site: catalog is at /catalog, quotes at /quote
   - Answer questions about Unicom Technologies
   - Be helpful and professional

**CONVERSATION STYLE:**
- Consultative and helpful like a professional sales consultant
- Ask questions to understand needs before showing products
- Explain technical issues in simple terms
- Proactive - offer next steps and solutions
- Professional yet friendly
- Use emojis sparingly (✨, 💡, ✓)

**CRITICAL RULES:**
- ALWAYS ask clarifying questions for vague product requests
- Use Filipino pesos (₱) for all pricing
- Be proactive - don't just answer, guide and suggest
- Keep responses concise but helpful`

// Gemini tool definitions
const searchProductsTool = {
    name: "searchProducts",
    description: "Search for products by keyword",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: "Search term",
            },
        },
        required: ["query"],
    },
}

const getProductDetailsTool = {
    name: "getProductDetails",
    description: "Get detailed product specs",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            productId: {
                type: SchemaType.STRING,
                description: "Product ID",
            },
        },
        required: ["productId"],
    },
}

const getMyQuotesTool = {
    name: "getMyQuotes",
    description: "Get user quotes",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: [],
    },
}

const getMyTicketsTool = {
    name: "getMyTickets",
    description: "Get user support tickets",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: [],
    },
}

// Groq fallback function with simpler approach
async function handleWithGroq(message: string, history: any[]): Promise<{ text: string, products: any[] }> {
    console.log("Using Groq fallback...")

    // Check if message looks like a product search
    const productKeywords = ['laptop', 'computer', 'desktop', 'keyboard', 'mouse', 'monitor',
        'printer', 'server', 'storage', 'network', 'cable', 'adapter', 'dell', 'hp', 'lenovo',
        'asus', 'acer', 'show', 'find', 'search', 'looking for', 'need', 'recommend', 'product']

    const lowerMessage = message.toLowerCase()
    const isProductQuery = productKeywords.some(keyword => lowerMessage.includes(keyword))

    let products: any[] = []
    let productContext = ""

    // If it looks like a product query, search the database first
    if (isProductQuery) {
        // Extract search terms
        const searchTerms = message.replace(/show|find|search|looking for|need|recommend|me|a|an|the|some/gi, '').trim()
        if (searchTerms.length > 2) {
            products = await searchProductsFromDB(searchTerms)
            if (products.length > 0) {
                productContext = `\n\nI found these products in our database:\n${products.map(p =>
                    `- ${p.name} by ${p.brand}: ₱${p.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (${p.inStock ? 'In Stock' : 'Out of Stock'})`
                ).join('\n')}\n\nPlease present these products to the user in a friendly, helpful way.`
            }
        }
    }

    // Build conversation history for Groq
    const groqHistory = history.slice(-6).map((msg: any) => ({
        role: msg.isBot ? "assistant" : "user" as const,
        content: msg.text
    }))

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: SYSTEM_INSTRUCTION + productContext },
            ...groqHistory,
            { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content || "How can I help you today?"

    return { text: responseText, products }
}

// Gemini handler with full function calling
async function handleWithGemini(message: string, history: any[], user: any): Promise<{ text: string, products: any[] }> {
    let activeTools: any[] = [searchProductsTool, getProductDetailsTool]

    if (user?.email) {
        activeTools = [searchProductsTool, getProductDetailsTool, getMyQuotesTool, getMyTicketsTool]
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: activeTools }] as any,
    })

    let validHistory = history.map((msg: any) => ({
        role: msg.isBot ? "model" : "user",
        parts: [{ text: msg.text }],
    }))

    if (validHistory.length > 0 && validHistory[0].role === "model") {
        validHistory = validHistory.slice(1)
    }

    const chat = model.startChat({ history: validHistory })
    const result = await chat.sendMessage(message)
    const response = result.response
    const calls = response.functionCalls?.() || null

    let finalText = ""
    let productsFound: any[] = []

    if (calls && calls.length > 0) {
        const call = calls[0]
        const functionResponseParts = []

        if (call.name === "searchProducts") {
            productsFound = await searchProductsFromDB((call.args as any).query)
            functionResponseParts.push({
                functionResponse: {
                    name: "searchProducts",
                    response: { products: productsFound },
                },
            })
        } else if (call.name === "getProductDetails") {
            const product = await getProductByIdFromDB((call.args as any).productId)
            if (product) productsFound = [product]
            functionResponseParts.push({
                functionResponse: {
                    name: "getProductDetails",
                    response: { product: product || {} },
                },
            })
        } else if (call.name === "getMyQuotes") {
            let userQuotes: any[] = []
            if (user?.email) {
                const client = await clientPromise!
                const db = client.db(process.env.MONGODB_DB || "unicom")
                const quotesCol = db.collection("quotes")
                const results = await quotesCol.find({ customerEmail: user.email }).toArray()
                userQuotes = results.map(q => ({
                    id: q.id,
                    status: q.status,
                    totalAmount: q.totalAmount,
                    createdAt: q.createdAt,
                    rejectionReason: q.rejectionReason || null,
                    items: q.items
                }))
            }
            functionResponseParts.push({
                functionResponse: {
                    name: "getMyQuotes",
                    response: { quotes: userQuotes },
                },
            })
        } else if (call.name === "getMyTickets") {
            let userTickets: any[] = []
            if (user?.email) {
                const client = await clientPromise!
                const db = client.db(process.env.MONGODB_DB || "unicom")
                const ticketsCol = db.collection("tickets")
                const results = await ticketsCol.find({ customerEmail: user.email }).toArray()
                userTickets = results.map(t => ({
                    id: t.id,
                    subject: t.subject,
                    status: t.status,
                    priority: t.priority,
                    createdAt: t.createdAt
                }))
            }
            functionResponseParts.push({
                functionResponse: {
                    name: "getMyTickets",
                    response: { tickets: userTickets },
                },
            })
        }

        if (functionResponseParts.length > 0) {
            const finalResult = await chat.sendMessage(functionResponseParts)
            finalText = finalResult.response.text?.() || "Here's what I found."
        }
    } else {
        finalText = response.text?.() || "How can I help you today?"
    }

    return { text: finalText, products: productsFound }
}

export async function POST(req: Request) {
    try {
        const { message, history, user } = await req.json()

        // Check if Gemini is available
        const hasGemini = !!process.env.GEMINI_API_KEY
        const hasGroq = !!process.env.GROQ_API_KEY

        if (!hasGemini && !hasGroq) {
            return NextResponse.json({ error: "No AI API keys configured" }, { status: 500 })
        }

        let result: { text: string, products: any[] }

        // Try Gemini first, fallback to Groq
        if (hasGemini) {
            try {
                result = await handleWithGemini(message, history, user)
                console.log("✓ Gemini response successful")
            } catch (geminiError: any) {
                console.warn("Gemini failed, trying Groq fallback:", geminiError.message?.slice(0, 100))

                if (hasGroq) {
                    result = await handleWithGroq(message, history)
                    console.log("✓ Groq fallback successful")
                } else {
                    throw geminiError // Re-throw if no fallback available
                }
            }
        } else if (hasGroq) {
            result = await handleWithGroq(message, history)
            console.log("✓ Groq response successful (primary)")
        } else {
            throw new Error("No AI service available")
        }

        return NextResponse.json({
            text: result.text,
            products: result.products.slice(0, 5)
        })

    } catch (error: any) {
        console.error("Chat API Error:", {
            message: error?.message?.slice(0, 200),
            name: error?.name,
            hasGemini: !!process.env.GEMINI_API_KEY,
            hasGroq: !!process.env.GROQ_API_KEY
        })
        return NextResponse.json(
            { text: "I'm having trouble connecting right now. Please try again in a moment." },
            { status: 200 }
        )
    }
}
