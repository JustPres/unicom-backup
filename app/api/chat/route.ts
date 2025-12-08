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

        console.log("DB Search - Query:", query)

        const words = query.split(/\s+/).filter(w => w.length > 1)
        let results: any[] = []

        // Strategy 1: Try AND search - all words must appear in name (best match)
        if (words.length > 1) {
            const andConditions = words.map(word => ({
                name: { $regex: word, $options: "i" }
            }))
            results = await products.find({ $and: andConditions }).limit(5).toArray()
            console.log("DB Search - AND match count:", results.length)
        }

        // Strategy 2: If AND fails, try exact phrase match
        if (results.length === 0) {
            results = await products.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                    { brand: { $regex: query, $options: "i" } },
                    { category: { $regex: query, $options: "i" } }
                ]
            }).limit(5).toArray()
            console.log("DB Search - Phrase match count:", results.length)
        }

        // Strategy 3: If still no results, try first significant word only
        if (results.length === 0 && words.length > 0) {
            // Prioritize non-brand words (skip common brand names for broader search)
            const significantWord = words.find(w => w.length > 3) || words[0]
            console.log("DB Search - Trying single word:", significantWord)

            results = await products.find({
                $or: [
                    { name: { $regex: significantWord, $options: "i" } },
                    { brand: { $regex: significantWord, $options: "i" } }
                ]
            }).limit(5).toArray()
        }

        console.log("DB Search - Final results count:", results.length)

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

// Search products by price range
async function searchProductsByPriceRange(minPrice?: number, maxPrice?: number, category?: string) {
    try {
        const client = await clientPromise!
        const db = client.db(process.env.MONGODB_DB || "unicom")
        const products = db.collection("products")

        const query: any = {}

        // Add price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {}
            if (minPrice !== undefined) query.price.$gte = minPrice
            if (maxPrice !== undefined) query.price.$lte = maxPrice
        }

        // Add category filter if provided
        if (category) {
            query.category = { $regex: category, $options: "i" }
        }

        console.log("Price range query:", JSON.stringify(query))

        const results = await products.find(query)
            .sort({ price: 1 }) // Sort by price ascending
            .limit(10) // Show more products for price range queries
            .toArray()

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
        console.error("DB price range search error:", error)
        return []
    }
}

// Helper function to parse price from user message
function parsePriceRange(message: string): { minPrice?: number, maxPrice?: number } {
    const lowerMsg = message.toLowerCase()
    let minPrice: number | undefined
    let maxPrice: number | undefined

    // Match patterns like "under 50000", "below 50k", "less than 50,000"
    const underMatch = lowerMsg.match(/(?:under|below|less than|cheaper than|max|maximum)\s*[₱$]?\s*(\d{1,3}(?:,?\d{3})*(?:k)?)/i)
    if (underMatch) {
        maxPrice = parsePrice(underMatch[1])
    }

    // Match patterns like "above 30000", "over 30k", "more than 30,000", "at least 30000"
    const overMatch = lowerMsg.match(/(?:above|over|more than|at least|min|minimum|from)\s*[₱$]?\s*(\d{1,3}(?:,?\d{3})*(?:k)?)/i)
    if (overMatch) {
        minPrice = parsePrice(overMatch[1])
    }

    // Match patterns like "between 30000 and 50000", "30k to 50k", "30000-50000"
    const betweenMatch = lowerMsg.match(/(?:between|from)?\s*[₱$]?\s*(\d{1,3}(?:,?\d{3})*(?:k)?)\s*(?:to|and|-|–)\s*[₱$]?\s*(\d{1,3}(?:,?\d{3})*(?:k)?)/i)
    if (betweenMatch) {
        minPrice = parsePrice(betweenMatch[1])
        maxPrice = parsePrice(betweenMatch[2])
    }

    return { minPrice, maxPrice }
}

// Parse price string to number (handles 50k, 50,000, etc)
function parsePrice(priceStr: string): number {
    let cleaned = priceStr.toLowerCase().replace(/[,₱$\s]/g, '')
    if (cleaned.endsWith('k')) {
        return parseFloat(cleaned.slice(0, -1)) * 1000
    }
    return parseFloat(cleaned)
}

// Convert products to TOON format (Token-Oriented Object Notation)
// Reduces token consumption by 30-60% compared to verbose JSON/list formats
function toTOON(products: any[]): string {
    if (products.length === 0) return "No products found"

    // Header row with field names (only once - saves tokens!)
    const header = "Name | Brand | Price | Stock"

    // Data rows - compact format
    const rows = products.map(p =>
        `${p.name} | ${p.brand} | ₱${p.price?.toLocaleString('en-PH')} | ${p.inStock ? 'Yes' : 'No'}`
    )

    return `${header}\n${rows.join('\n')}`
}

// System instruction for both models
const SYSTEM_INSTRUCTION = `You are a comprehensive AI assistant for Unicom Technologies, Inc., a professional IT systems integrator. You can help with EVERYTHING related to products, quotes, support, and account management.

**ABOUT UNICOM TECHNOLOGIES:**
Unicom Technologies, Inc., established in February 2012, is an IT systems supplier that provides quality computer hardware and application software to small and medium-sized businesses (SMB) nationwide. We have steadily transformed from reselling into an "end-to-end" data center designer and project developer.

**OUR MISSION:** World-class systems integrator utilizing I.T. Best Practices to deliver cost-effective solutions
**OUR VISION:** To be recognized as a Unified Systems Integrator of Global Standards
**OUR VALUES:** Global Standards, Integrity, Innovation

**CONTACT:** Phone: (0925) 5000-493 | Email: dc.unicomtec@gmail.com | Office: Marketing Office: 3F Unique Plaza, Sierra Madre St., Highway Hills, Mandaluyong City

**IMPORTANT: QUOTE-BASED SYSTEM (NO ORDERS)**
- This website is a QUOTE REQUEST system, NOT an e-commerce store
- Users CANNOT buy products directly or place orders online
- Users can only REQUEST QUOTES for products they're interested in
- After submitting a quote, our sales team will review and respond with pricing
- There are NO orders, NO shopping cart, NO online purchasing, NO checkout
- NEVER mention "orders", "ordering", "purchasing online", "checkout", or "tracking orders"
- Only use terms like "quote", "quote request", "quotation"

**COMPLETE WEBSITE NAVIGATION & FUNCTIONALITY:**

📌 **PUBLIC PAGES (No login required):**

1. **/ (Home Page)**
   - Main landing page with company overview
   - Featured products section
   - Quick links to catalog and services
   - Company highlights and statistics

2. **/catalog (Product Catalog)**
   - Browse ALL products without logging in
   - Filter by category (Laptops, Desktops, Monitors, Keyboards, etc.)
   - Filter by brand (Dell, HP, Lenovo, Asus, Acer, etc.)
   - Search products by name or keyword
   - View product details, prices, and stock status
   - Compare products feature available
   - NOTE: To request a quote for products, user must login first

3. **/about (About Us)**
   - Company history (founded February 2012)
   - Company statistics: 100+ satisfied clients, 12+ years, 200+ projects, nationwide service
   - Mission, Vision, Values sections
   - Our approach and company story

4. **/services (Our Services)** - 6 main services:
   - IT Systems Integration
   - Data Center Design & Installation
   - Infrastructure Assessment
   - Computer Hardware & Software Supply
   - Auxiliary Systems Building
   - Technical Support & Consultation

5. **/support (Support & FAQs)**
   - Contact information (phone, email, address, business hours)
   - Frequently Asked Questions (support hours, remote support, warranty)
   - Business Hours: Mon-Fri 9AM-6PM, Sat 10AM-4PM
   - For LOGGED-IN users: buttons to submit tickets and view tickets

6. **/login (Login Page)**
   - Fields: Email and Password
   - Link to register if no account
   - Link to Admin Portal for admin users

7. **/register (Registration Page)**
   - Fields: Full Name, Email, Password, Confirm Password
   - NO company or phone fields (keep this accurate!)
   - After registration, user receives email with verification link
   - Must verify email before full access

📌 **CUSTOMER PAGES (Login REQUIRED):**

8. **/quote (Request Quote Page)** [REQUIRES LOGIN]
   - Select products from catalog to add to quote
   - Specify quantities for each product
   - Add special notes or requirements
   - Review quote before submitting
   - Submit quote request for review
   - If not logged in, automatically redirects to /login

9. **/dashboard (Customer Dashboard)** [REQUIRES LOGIN]
   - Overview of account activity
   - Recent quotes summary with status
   - Quick navigation to quotes

10. **/customer/quotes (My Quotes)** [REQUIRES LOGIN]
    - View ALL submitted quote requests
    - Quote statuses: Pending, Approved, Rejected
    - View quote details (products, quantities, total amount)
    - See rejection reasons if applicable
    - Download quote as PDF

11. **/customer/tickets (My Support Tickets)** [REQUIRES LOGIN]
    - View all submitted support tickets
    - Track ticket status (Open, In Progress, Resolved)

12. **/support-ticket (Submit Support Ticket)** [REQUIRES LOGIN]
    - Create new support ticket
    - Enter subject and description

**QUOTE REQUEST PROCESS (Step-by-Step):**
1. Browse products at /catalog (no login needed)
2. When ready to request quote, register at /register (if no account)
3. Check email for verification link and verify account
4. Login at /login
5. Go to /quote page
6. Select products and quantities
7. Add any special notes
8. Review and confirm quote
9. Submit quote request
10. Wait for our sales team to review (usually within 24-48 hours)
11. Check quote status at /customer/quotes

**COMMON USER QUESTIONS & ANSWERS:**

Q: "How do I register?"
A: "Go to /register and fill out the form with your full name, email, password, and confirm password. You'll then receive a verification email - click the link to verify your account, then you can login."

Q: "How do I get a quote?"
A: "To request a quote: 1) Register at /register, 2) Verify your email, 3) Login at /login, 4) Go to /quote, 5) Select products and quantities, 6) Submit your request. Our team will respond within 24-48 hours."

Q: "Can I browse products without logging in?"
A: "Yes! You can browse all products at /catalog without logging in. However, to request a quote, you'll need to create an account first."

Q: "What happens after I submit a quote?"
A: "Our sales team reviews your request and prepares pricing. You can track your quote status at /customer/quotes. Typical response time is 24-48 hours."

Q: "How do I check my quote status?"
A: "Login and go to /customer/quotes. You'll see all your quotes with their current status (Pending, Approved, or Rejected)."

Q: "Do you sell directly online?"
A: "No, we don't do direct online sales. This is a quote request system - you request quotes for products, and our sales team responds with custom pricing."

Q: "How do I submit a support ticket?"
A: "Login to your account, then go to /support-ticket to submit a new ticket, or check /customer/tickets to view your existing tickets."

**YOUR CAPABILITIES:**
1. **PRODUCT SEARCH** - Search database for products by name, category, brand, or price range
2. **NAVIGATION GUIDANCE** - Direct users to the right pages for their needs
3. **QUOTE PROCESS HELP** - Explain how to request and track quotes
4. **ACCOUNT HELP** - Guide users through registration, login, profile management
5. **GENERAL INFO** - Answer questions about Unicom, services, contact info

**CONVERSATION STYLE - CRITICAL:**
- Be CONCISE - short, direct responses (2-4 sentences max for simple questions)
- Answer ONLY what was asked - don't add extra instructions unless requested
- When showing products, just list them briefly - don't explain each one in detail
- Only mention login/quote process IF the user asks about it or wants to purchase
- Avoid repeating information the user already knows
- Don't give step-by-step instructions unless explicitly asked "how do I..."
- Use Filipino pesos (₱) for prices

**FORMATTING RULES - VERY IMPORTANT:**
- DO NOT use emojis at all - no 🎮 📝 ✨ or any emoji
- DO NOT use markdown formatting - no **bold** or *italic* asterisks
- DO NOT show routes like /catalog or /quote - use friendly names instead:
  * Instead of "/catalog" say "Catalog page"
  * Instead of "/quote" say "Quote page" 
  * Instead of "/login" say "Login page"
  * Instead of "/register" say "Registration page"
  * Instead of "/dashboard" say "Dashboard"
  * Instead of "/support" say "Support page"
  * Instead of "/about" say "About page"
  * Instead of "/services" say "Services page"
- Keep responses plain text, clean and professional

**CRITICAL RULES:**
- NEVER say users can request quotes without logging in
- NEVER mention orders, purchasing, checkout, or buying online
- ALWAYS guide users to register/login for quote-related actions
- Use only "quote", "quotation", "quote request" terminology`

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

// Groq fallback function with improved product search
async function handleWithGroq(message: string, history: any[]): Promise<{ text: string, products: any[] }> {
    console.log("Using Groq fallback...")

    // Expanded product keywords for better detection
    const productKeywords = [
        // Product types
        'laptop', 'laptops', 'computer', 'computers', 'desktop', 'desktops',
        'keyboard', 'keyboards', 'mouse', 'mice', 'monitor', 'monitors',
        'printer', 'printers', 'server', 'servers', 'storage', 'network',
        'cable', 'cables', 'adapter', 'adapters', 'router', 'switch',
        'ups', 'ram', 'ssd', 'hdd', 'hard drive', 'memory', 'processor', 'cpu',
        'speaker', 'speakers', 'headset', 'headsets', 'headphone', 'headphones',
        'webcam', 'camera', 'microphone', 'mic', 'usb', 'hub', 'dock', 'cooler',
        'fan', 'case', 'power supply', 'psu', 'gpu', 'graphics card', 'motherboard',
        // Brands  
        'dell', 'hp', 'lenovo', 'asus', 'acer', 'microsoft', 'logitech',
        'samsung', 'intel', 'amd', 'nvidia', 'cisco', 'ubiquiti',
        'edifier', 'sandisk', 'seagate', 'western digital', 'wd', 'kingston',
        'corsair', 'razer', 'steelseries', 'hyperx', 'jbl', 'bose', 'sony',
        'tuf', 'rog', 'prime', 'proart', 'vivobook', 'zenbook', 'thinkpad',
        // Action words
        'show', 'find', 'search', 'looking', 'need', 'recommend', 'products',
        'buy', 'purchase', 'price', 'stock', 'available', 'catalog', 'browse',
        'get', 'want', 'interested',
        // Price keywords
        'under', 'below', 'above', 'between', 'budget', 'cheap', 'affordable', 'expensive'
    ]

    // Price range keywords
    const priceRangeKeywords = ['under', 'below', 'above', 'over', 'between', 'less than', 'more than', 'budget', 'cheap', 'affordable', 'k', '000']

    const lowerMessage = message.toLowerCase()

    // Check if user wants ALL products (should redirect to catalog)
    const wantsAllProducts = /\b(all|every|everything|all of|show all|see all|list all)\b.*\b(product|item|stock|speaker|laptop|monitor|keyboard)/i.test(lowerMessage) ||
        /\b(product|item|stock|speaker|laptop|monitor|keyboard)s?\b.*\b(all|every|everything)\b/i.test(lowerMessage)

    const isProductQuery = productKeywords.some(keyword => lowerMessage.includes(keyword))
    const hasPriceRange = priceRangeKeywords.some(keyword => lowerMessage.includes(keyword))

    let products: any[] = []
    let productContext = ""

    // If user wants ALL products, redirect to catalog
    if (wantsAllProducts) {
        productContext = `
The user wants to see ALL products. Tell them: "We have many products in our catalog! Please visit /catalog to browse all our products with filters by category and brand. Is there a specific type of product you're looking for?"`
    }
    // If it looks like a product query, search the database
    else if (isProductQuery) {
        // Check for price range first
        const { minPrice, maxPrice } = parsePriceRange(message)

        if (minPrice !== undefined || maxPrice !== undefined) {
            // Price range query detected
            console.log("Groq - Price range detected:", { minPrice, maxPrice })

            // Try to extract category from message
            const categoryMatch = lowerMessage.match(/\b(laptop|computer|desktop|keyboard|mouse|monitor|printer|server|storage|network|cable|adapter|router|switch|ups|ram|ssd|hdd)\w*/i)
            const category = categoryMatch ? categoryMatch[1] : undefined

            console.log("Groq - Category:", category)

            products = await searchProductsByPriceRange(minPrice, maxPrice, category)
            console.log("Groq - Products found by price range:", products.length)

            if (products.length > 0) {
                const priceDesc = minPrice && maxPrice
                    ? `between ₱${minPrice.toLocaleString()} and ₱${maxPrice.toLocaleString()} `
                    : maxPrice
                        ? `under ₱${maxPrice.toLocaleString()} `
                        : `above ₱${minPrice?.toLocaleString()} `

                productContext = `

REAL products ${category ? `(${category}s) ` : ''}${priceDesc}from our database - ONLY mention these:
${toTOON(products)}

Present helpfully. Prices in ₱. Direct to /catalog or /quote if interested.`
            } else {
                productContext = `

I searched our database for products ${maxPrice ? `under ₱${maxPrice.toLocaleString()}` : `above ₱${minPrice?.toLocaleString()}`} but couldn't find matching items. Please tell the user we don't have products in that price range right now, and suggest they try a different price range or browse / catalog.`
            }
        } else {
            // Regular text search
            const searchTerms = message
                .toLowerCase()
                .replace(/\b(show|find|search|looking for|looking|need|recommend|me|an|the|some|do you have|can you|please|i want|i need|can i|view)\b/gi, '')
                .replace(/\s+/g, ' ')  // Collapse multiple spaces
                .trim()

            console.log("Groq - Product search terms:", searchTerms)

            if (searchTerms.length > 1) {
                products = await searchProductsFromDB(searchTerms)
                console.log("Groq - Products found:", products.length)

                // If no results, try searching by individual words
                if (products.length === 0) {
                    const words = searchTerms.split(/\s+/).filter(w => w.length > 2)
                    for (const word of words) {
                        products = await searchProductsFromDB(word)
                        if (products.length > 0) {
                            console.log("Groq - Found products with word:", word)
                            break
                        }
                    }
                }

                if (products.length > 0) {
                    productContext = `

REAL products from our database - ONLY mention these:
${toTOON(products)}

Present helpfully. Prices in ₱. Direct to /catalog or /quote if interested.`
                } else {
                    productContext = `

I searched our database but couldn't find products matching "${searchTerms}". Please tell the user we don't have that specific product in our catalog right now, and suggest they browse / catalog or ask about other products we might have.`
                }

            }
        }
    }

    // Build conversation history for Groq (limit to recent messages)
    const groqHistory: Array<{ role: "user" | "assistant", content: string }> = history.slice(-6).map((msg: any) => ({
        role: (msg.isBot ? "assistant" : "user") as "user" | "assistant",
        content: msg.text
    }))

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system" as const, content: SYSTEM_INSTRUCTION + productContext },
            ...groqHistory,
            { role: "user" as const, content: message }
        ],
        temperature: 0.5, // Lower temperature for more factual responses
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
